// Client-side SHA-256 Merkle Tree computation
export class MerkleAuditClient {
  public static async sha256(str: string): Promise<string> {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public static async computeMerkleRoot(records: any[]): Promise<string> {
    if (records.length === 0) {
      return this.sha256('EMPTY_CIVICGRID_BLOCK');
    }

    let currentLevel: string[] = [];
    for (const r of records) {
      const h = await this.sha256(JSON.stringify(r));
      currentLevel.push(h);
    }

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || currentLevel[i];
        const combined = await this.sha256(left + right);
        nextLevel.push(combined);
      }
      currentLevel = nextLevel;
    }

    return currentLevel[0] || '0'.repeat(64);
  }
}
