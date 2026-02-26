/**
 * GitHub API を使ったファイル操作ユーティリティ
 * Vercel（読み取り専用ファイルシステム）でも記事の作成・編集・削除が可能
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // "owner/repo" 形式
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const GITHUB_API = 'https://api.github.com';

function getHeaders() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    throw new Error('GITHUB_TOKEN と GITHUB_REPO の環境変数が必要です');
  }
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

/**
 * ファイルの取得（SHA を含む）
 */
export async function getFileFromGitHub(
  filePath: string
): Promise<{ content: string; sha: string } | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
      { headers: getHeaders(), cache: 'no-store' }
    );

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { content, sha: data.sha };
  } catch (error) {
    console.error('GitHub getFile error:', error);
    return null;
  }
}

/**
 * ディレクトリ内のファイル一覧を取得
 */
export async function listFilesFromGitHub(
  dirPath: string
): Promise<Array<{ name: string; path: string; sha: string }>> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${dirPath}?ref=${GITHUB_BRANCH}`,
      { headers: getHeaders(), cache: 'no-store' }
    );

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter((item: { type: string; name: string }) =>
        item.type === 'file' && (item.name.endsWith('.mdx') || item.name.endsWith('.md'))
      )
      .map((item: { name: string; path: string; sha: string }) => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
      }));
  } catch (error) {
    console.error('GitHub listFiles error:', error);
    return [];
  }
}

/**
 * ファイルの作成・更新
 * sha を渡すと更新、渡さないと新規作成
 */
export async function createOrUpdateFile(
  filePath: string,
  content: string,
  message: string,
  sha?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const body: Record<string, string> = {
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch: GITHUB_BRANCH,
    };

    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(
      `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || `GitHub API error: ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    const message2 = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message2 };
  }
}

/**
 * ファイルの削除
 */
export async function deleteFileFromGitHub(
  filePath: string,
  sha: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({
          message,
          sha,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || `GitHub API error: ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    const message2 = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message2 };
  }
}
