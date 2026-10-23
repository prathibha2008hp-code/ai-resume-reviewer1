import subprocess
import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


class SqliteGitIgnoreTests(unittest.TestCase):
    def test_local_sqlite_files_are_ignored(self):
        paths = ["backend/app.db", "data/local.sqlite", "cache/test.sqlite3"]
        result = subprocess.run(
            ["git", "check-ignore", "--no-index", "--", *paths],
            cwd=REPOSITORY_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(set(result.stdout.splitlines()), set(paths))

    def test_local_database_is_not_tracked(self):
        result = subprocess.run(
            ["git", "ls-files", "--error-unmatch", "--", "backend/app.db"],
            cwd=REPOSITORY_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

        self.assertNotEqual(result.returncode, 0)


if __name__ == "__main__":
    unittest.main()
