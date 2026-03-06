// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NhatTamCertificate {
    struct Certificate {
        string orderId;
        string buyerName;
        string recipientName;
        string message;
        bytes32 contentHash;
        uint256 timestamp;
    }

    mapping(string => Certificate) public certificates;
    
    event CertificateCreated(
        string orderId,
        string buyerName,
        string recipientName,
        bytes32 contentHash,
        uint256 timestamp
    );

    function createCertificate(
        string memory orderId,
        string memory buyerName,
        string memory recipientName,
        string memory message
    ) public returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(buyerName, recipientName, message, block.timestamp));
        
        certificates[orderId] = Certificate({
            orderId: orderId,
            buyerName: buyerName,
            recipientName: recipientName,
            message: message,
            contentHash: hash,
            timestamp: block.timestamp
        });

        emit CertificateCreated(orderId, buyerName, recipientName, hash, block.timestamp);
        return hash;
    }

    function getCertificate(string memory orderId) public view returns (
        string memory, string memory, string memory, bytes32, uint256
    ) {
        Certificate memory cert = certificates[orderId];
        return (cert.buyerName, cert.recipientName, cert.message, cert.contentHash, cert.timestamp);
    }
}
