const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EvidenceRegistry Contract", function () {
  let EvidenceRegistry, registry, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    EvidenceRegistry = await ethers.getContractFactory("EvidenceRegistry");
    registry = await EvidenceRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("Should register evidence fingerprint accurately", async function () {
    const evidenceId = "EV-2026-TEST01";
    const sha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const uploader = "USER_INVESTIGATOR_01";

    await registry.registerEvidence(evidenceId, sha256, uploader);

    const [id, recordedHash, uploaderRef, timestamp, custodyCount] = await registry.getEvidence(evidenceId);
    expect(id).to.equal(evidenceId);
    expect(recordedHash).to.equal(sha256);
    expect(uploaderRef).to.equal(uploader);
    expect(custodyCount).to.equal(1n);
  });

  it("Should verify integrity match correctly", async function () {
    const evidenceId = "EV-2026-TEST02";
    const sha256 = "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e";
    const uploader = "USER_INVESTIGATOR_02";

    await registry.registerEvidence(evidenceId, sha256, uploader);

    const [isMatch, , recordedHash] = await registry.verifyEvidenceIntegrity(evidenceId, sha256);
    expect(isMatch).to.be.true;
    expect(recordedHash).to.equal(sha256);

    const alteredHash = "b591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146f";
    const [isMismatch] = await registry.verifyEvidenceIntegrity(evidenceId, alteredHash);
    expect(isMismatch).to.be.false;
  });

  it("Should log and retrieve chronological custody events", async function () {
    const evidenceId = "EV-2026-TEST03";
    const sha256 = "c591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e";
    const uploader = "USER_INVESTIGATOR_03";

    await registry.registerEvidence(evidenceId, sha256, uploader);
    await registry.logCustodyEvent(
      evidenceId,
      "AI_ANALYSIS_COMPLETED",
      "SYSTEM_AI_ENGINE",
      sha256,
      "Deepfake detection score computed"
    );

    const events = await registry.getCustodyEvents(evidenceId);
    expect(events.length).to.equal(2);
    expect(events[1].eventType).to.equal("AI_ANALYSIS_COMPLETED");
  });
});

