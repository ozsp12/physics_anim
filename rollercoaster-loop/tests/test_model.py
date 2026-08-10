"""Analytical regression tests for the vertical-loop model."""

from __future__ import annotations

import math
import unittest

G = 9.81


def critical_height(radius: float) -> float:
    """Return the minimum release height for continuous contact."""
    if radius <= 0:
        raise ValueError("radius must be positive")
    return 2.5 * radius


def speed_squared(height: float, radius: float, theta: float) -> float:
    """Return v^2 from conservation of mechanical energy."""
    return 2.0 * G * (height - radius * (1.0 - math.cos(theta)))


def normal_acceleration(height: float, radius: float, theta: float) -> float:
    """Return N/m while the particle remains constrained to the loop."""
    return speed_squared(height, radius, theta) / radius + G * math.cos(theta)


def classify(height: float, radius: float, tolerance: float = 1e-12) -> str:
    """Classify the exact analytical motion regime from h/R."""
    if radius <= 0:
        raise ValueError("radius must be positive")
    q = height / radius
    if q < 1.0 - tolerance:
        return "return"
    if abs(q - 1.0) <= tolerance:
        return "side_limit"
    if q < 2.5 - tolerance:
        return "detach"
    if abs(q - 2.5) <= tolerance:
        return "critical"
    return "complete"


class VerticalLoopModelTests(unittest.TestCase):
    def test_critical_height_scales_linearly(self) -> None:
        self.assertAlmostEqual(critical_height(2.0), 5.0)
        self.assertAlmostEqual(critical_height(0.8), 2.0)

    def test_top_speed_at_critical_height(self) -> None:
        radius = 2.0
        height = critical_height(radius)
        self.assertAlmostEqual(speed_squared(height, radius, math.pi), G * radius)

    def test_normal_reaction_vanishes_at_critical_top(self) -> None:
        radius = 1.7
        height = critical_height(radius)
        self.assertAlmostEqual(normal_acceleration(height, radius, math.pi), 0.0, places=12)

    def test_turning_point_for_low_release(self) -> None:
        radius = 2.0
        height = 0.6 * radius
        theta_max = math.acos(1.0 - height / radius)
        self.assertAlmostEqual(speed_squared(height, radius, theta_max), 0.0, places=12)
        self.assertGreater(normal_acceleration(height, radius, theta_max), 0.0)

    def test_detachment_angle(self) -> None:
        radius = 2.0
        q = 1.8
        height = q * radius
        theta_detach = math.acos((2.0 - 2.0 * q) / 3.0)
        self.assertAlmostEqual(normal_acceleration(height, radius, theta_detach), 0.0, places=12)
        self.assertGreater(speed_squared(height, radius, theta_detach), 0.0)

    def test_representative_regimes(self) -> None:
        radius = 2.0
        cases = {
            0.75 * radius: "return",
            1.00 * radius: "side_limit",
            1.80 * radius: "detach",
            2.50 * radius: "critical",
            3.00 * radius: "complete",
        }
        for height, expected in cases.items():
            with self.subTest(height=height):
                self.assertEqual(classify(height, radius), expected)

    def test_nonpositive_radius_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            critical_height(0.0)
        with self.assertRaises(ValueError):
            classify(1.0, -1.0)


if __name__ == "__main__":
    unittest.main()
