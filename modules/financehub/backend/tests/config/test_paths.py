import unittest
from pathlib import Path

from modules.financehub.backend.config import settings

class TestPathSettings(unittest.TestCase):
    def test_static_dir_points_to_shared_frontend(self):
        """
        Tests if the STATIC_DIR in PathSettings correctly points to the
        'shared/frontend/dist' directory.
        """
        # Get the static directory from the global settings object
        static_dir = settings.PATHS.STATIC_DIR
        
        # Ensure it's a Path object
        self.assertIsInstance(static_dir, Path, "STATIC_DIR should be a Path object")
        
        # Check if the path ends with the expected directory
        self.assertTrue(
            str(static_dir).endswith("shared/frontend/dist"),
            f"STATIC_DIR should point to 'shared/frontend/dist', but it points to '{static_dir}'"
        )

if __name__ == '__main__':
    unittest.main() 