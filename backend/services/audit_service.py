import hashlib
import json

class AuditService:
    @staticmethod
    def sha256(data: str) -> str:
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    @staticmethod
    def compute_merkle_root(records: list) -> dict:
        """
        FEATURE 3: Cryptographic Merkle-Tree Audit Lineage
        Hashed into a SHA-256 Merkle Tree to prevent political score tampering.
        """
        if not records:
            empty_root = hashlib.sha256(b"EMPTY_CIVICGRID_BLOCK").hexdigest()
            return {"merkle_root": empty_root, "leaf_count": 0, "tree_depth": 0}

        leaves = []
        for r in records:
            # Deterministic JSON canonical string
            serialized = json.dumps(r, sort_keys=True)
            leaf_hash = AuditService.sha256(serialized)
            leaves.append(leaf_hash)

        current_level = list(leaves)
        tree_levels = [list(current_level)]
        
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else current_level[i]
                combined = AuditService.sha256(left + right)
                next_level.append(combined)
            current_level = next_level
            tree_levels.append(list(current_level))

        merkle_root = current_level[0]
        return {
            "merkle_root": merkle_root,
            "leaf_count": len(leaves),
            "tree_depth": len(tree_levels),
            "sample_leaves": leaves[:4],
            "verified_audit_status": "CRYPTOGRAPHICALLY_SEALED"
        }

audit_service = AuditService()
