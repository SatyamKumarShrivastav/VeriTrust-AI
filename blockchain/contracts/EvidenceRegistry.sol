// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceRegistry
 * @dev VeriTrust AI Smart Contract for Digital Evidence Integrity and Provenance.
 * Maintains tamper-evident registration of file SHA-256 digests and custody audit events.
 * Developed for VeriTrust AI platform by Mr. S. K. Shrivastav.
 */
contract EvidenceRegistry {
    address public owner;

    struct EvidenceRecord {
        string evidenceId;
        string sha256Hash;
        string uploaderRef;
        uint256 registeredAt;
        bool exists;
        uint256 custodyEventCount;
    }

    struct CustodyEventRecord {
        string eventType;
        string actorRef;
        string eventDataHash;
        uint256 timestamp;
        string notes;
    }

    // Mapping from evidenceId (e.g., "EV-2026-A1B2C3") to EvidenceRecord
    mapping(string => EvidenceRecord) private evidenceRecords;
    
    // Mapping from evidenceId to an array of CustodyEventRecords
    mapping(string => CustodyEventRecord[]) private custodyEvents;

    // List of registered evidence IDs for enumerable lookups
    string[] private allEvidenceIds;

    // Events emitted for off-chain indexing
    event EvidenceRegistered(
        string indexed evidenceId,
        string sha256Hash,
        string uploaderRef,
        uint256 timestamp
    );

    event CustodyEventLogged(
        string indexed evidenceId,
        string eventType,
        string actorRef,
        string eventDataHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only registry owner may perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a newly captured or submitted piece of digital evidence
     * @param _evidenceId Unique evidence identifier
     * @param _sha256Hash SHA-256 cryptographic digest of the original media
     * @param _uploaderRef Anonymized reference or public identity of the uploader
     */
    function registerEvidence(
        string memory _evidenceId,
        string memory _sha256Hash,
        string memory _uploaderRef
    ) public {
        require(bytes(_evidenceId).length > 0, "Evidence ID cannot be empty");
        require(bytes(_sha256Hash).length == 64, "SHA-256 hash must be 64 hex characters");
        require(!evidenceRecords[_evidenceId].exists, "Evidence already registered on-chain");

        evidenceRecords[_evidenceId] = EvidenceRecord({
            evidenceId: _evidenceId,
            sha256Hash: _sha256Hash,
            uploaderRef: _uploaderRef,
            registeredAt: block.timestamp,
            exists: true,
            custodyEventCount: 1
        });

        allEvidenceIds.push(_evidenceId);

        // Record the initial registration as custody event #1
        custodyEvents[_evidenceId].push(CustodyEventRecord({
            eventType: "INITIAL_REGISTRATION",
            actorRef: _uploaderRef,
            eventDataHash: _sha256Hash,
            timestamp: block.timestamp,
            notes: "Initial evidence registration on VeriTrust AI ledger"
        }));

        emit EvidenceRegistered(_evidenceId, _sha256Hash, _uploaderRef, block.timestamp);
    }

    /**
     * @notice Append a verifiable custody transfer or access event
     */
    function logCustodyEvent(
        string memory _evidenceId,
        string memory _eventType,
        string memory _actorRef,
        string memory _eventDataHash,
        string memory _notes
    ) public {
        require(evidenceRecords[_evidenceId].exists, "Evidence record does not exist");

        custodyEvents[_evidenceId].push(CustodyEventRecord({
            eventType: _eventType,
            actorRef: _actorRef,
            eventDataHash: _eventDataHash,
            timestamp: block.timestamp,
            notes: _notes
        }));

        evidenceRecords[_evidenceId].custodyEventCount++;

        emit CustodyEventLogged(
            _evidenceId,
            _eventType,
            _actorRef,
            _eventDataHash,
            block.timestamp
        );
    }

    /**
     * @notice Verify if a given file hash matches the on-chain recorded fingerprint
     */
    function verifyEvidenceIntegrity(
        string memory _evidenceId,
        string memory _currentHash
    ) public view returns (bool isMatch, uint256 registeredTimestamp, string memory recordedHash) {
        require(evidenceRecords[_evidenceId].exists, "Evidence ID not registered");
        EvidenceRecord memory record = evidenceRecords[_evidenceId];
        
        bool matchFound = keccak256(bytes(record.sha256Hash)) == keccak256(bytes(_currentHash));
        return (matchFound, record.registeredAt, record.sha256Hash);
    }

    /**
     * @notice Retrieve details of an evidence record
     */
    function getEvidence(string memory _evidenceId)
        public
        view
        returns (
            string memory evidenceId,
            string memory sha256Hash,
            string memory uploaderRef,
            uint256 registeredAt,
            uint256 custodyCount
        )
    {
        require(evidenceRecords[_evidenceId].exists, "Evidence not found");
        EvidenceRecord memory record = evidenceRecords[_evidenceId];
        return (
            record.evidenceId,
            record.sha256Hash,
            record.uploaderRef,
            record.registeredAt,
            record.custodyEventCount
        );
    }

    /**
     * @notice Retrieve all custody events for an evidence item
     */
    function getCustodyEvents(string memory _evidenceId)
        public
        view
        returns (CustodyEventRecord[] memory)
    {
        require(evidenceRecords[_evidenceId].exists, "Evidence not found");
        return custodyEvents[_evidenceId];
    }

    /**
     * @notice Total number of registered evidence items on chain
     */
    function getTotalEvidenceCount() public view returns (uint256) {
        return allEvidenceIds.length;
    }
}

