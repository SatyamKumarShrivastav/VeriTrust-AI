"""
VeriTrust AI — Blockchain / Ledger Service
Evidence registration and custody-event recording on a local Ethereum-compatible network.

Integration boundary: When the blockchain node is unavailable, records are created
with status "unavailable". False successful transactions are NEVER simulated.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.blockchain import BlockchainTransaction

logger = logging.getLogger(__name__)

# Integration boundary: attempt Web3 connection
WEB3_AVAILABLE = False
web3_client = None

try:
    from web3 import Web3  # type: ignore
    if settings.BLOCKCHAIN_ENABLED and settings.BLOCKCHAIN_RPC_URL:
        web3_client = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_RPC_URL))
        if web3_client.is_connected():
            WEB3_AVAILABLE = True
            logger.info(f"Web3 connected to {settings.BLOCKCHAIN_RPC_URL}")
        else:
            logger.warning("Web3 provider not reachable. Blockchain features will report as unavailable.")
except ImportError:
    logger.warning("web3 library not installed. Blockchain features are unavailable.")
except Exception as e:
    logger.warning(f"Blockchain initialization error: {e}")


def register_evidence_on_blockchain(
    db: Session,
    evidence_id_int: int,
    evidence_id_str: str,
    sha256_hash: str,
    uploader_id: int,
) -> BlockchainTransaction:
    """
    Register evidence fingerprint on the blockchain.
    If the network is unavailable, records status as 'unavailable'.
    """
    tx_record = BlockchainTransaction(
        evidence_id=evidence_id_int,
        event_type="EVIDENCE_REGISTERED",
        network=settings.BLOCKCHAIN_NETWORK,
        status="pending",
    )

    if not WEB3_AVAILABLE or not settings.BLOCKCHAIN_ENABLED:
        tx_record.status = "unavailable"
        tx_record.error_message = (
            "Blockchain network is not available. Configure BLOCKCHAIN_ENABLED=true "
            "and ensure the local Hardhat node is running to enable on-chain registration."
        )
        db.add(tx_record)
        db.commit()
        db.refresh(tx_record)
        logger.info(f"Blockchain unavailable for evidence {evidence_id_str}; recorded as unavailable.")
        return tx_record

    try:
        # Prepare on-chain data (hashes and IDs only — no PII or raw media)
        on_chain_data = {
            "evidence_id": evidence_id_str,
            "file_sha256": sha256_hash,
            "uploader_ref": str(uploader_id),
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "event_type": "EVIDENCE_REGISTERED",
        }

        # If a deployed contract address is configured, call the contract.
        # Otherwise, use a simple ETH transaction as a data-bearing anchor.
        if settings.CONTRACT_ADDRESS and settings.DEPLOYER_PRIVATE_KEY:
            # TODO: Implement smart contract call when contract is deployed
            # For now, record as pending deployment
            tx_record.status = "pending"
            tx_record.error_message = "Smart contract not yet deployed. Run: cd blockchain && npx hardhat run scripts/deploy.js --network localhost"
            db.add(tx_record)
            db.commit()
            db.refresh(tx_record)
            return tx_record
        else:
            # Basic data transaction as an anchor (development mode)
            data_hex = json.dumps(on_chain_data).encode().hex()
            account = web3_client.eth.accounts[0] if web3_client.eth.accounts else None

            if not account:
                raise ValueError("No accounts available on the local blockchain node.")

            tx_hash = web3_client.eth.send_transaction({
                "from": account,
                "to": account,
                "value": 0,
                "data": "0x" + data_hex[:2000],  # Limit data size
            })

            receipt = web3_client.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
            tx_record.tx_hash = tx_hash.hex()
            tx_record.block_number = receipt["blockNumber"]
            tx_record.block_hash = receipt["blockHash"].hex()
            tx_record.gas_used = receipt["gasUsed"]
            tx_record.status = "confirmed"
            tx_record.confirmed_at = datetime.now(timezone.utc)
            tx_record.event_reference = evidence_id_str

            db.add(tx_record)
            db.commit()
            db.refresh(tx_record)
            logger.info(f"Evidence {evidence_id_str} registered on-chain: {tx_record.tx_hash}")
            return tx_record

    except Exception as e:
        logger.error(f"Blockchain registration error for {evidence_id_str}: {e}")
        tx_record.status = "failed"
        tx_record.error_message = str(e)
        db.add(tx_record)
        db.commit()
        db.refresh(tx_record)
        return tx_record


def verify_on_chain(tx_hash: str) -> Dict[str, Any]:
    """
    Verify a transaction exists on-chain.
    Returns actual result or unavailable status — never fabricates confirmation.
    """
    if not WEB3_AVAILABLE:
        return {"status": "unavailable", "detail": "Blockchain network not reachable."}

    try:
        receipt = web3_client.eth.get_transaction_receipt(tx_hash)
        if receipt:
            return {
                "status": "confirmed",
                "block_number": receipt["blockNumber"],
                "gas_used": receipt["gasUsed"],
                "detail": "Transaction confirmed on-chain.",
            }
        return {"status": "pending", "detail": "Transaction not yet mined."}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

