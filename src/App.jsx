// src/App.jsx
import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
} from "chart.js";
import { Line } from "react-chartjs-2";
import rough from "roughjs/bin/rough";
import CubicSpline from "cubic-spline";
import "@fontsource/comic-neue";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
);

const dataPoints = [
  { x: 0, y: 0 },
  { x: 12, y: 0.75 },
  { x: 18, y: 0.9 },
  { x: 30, y: 0.97 },
  { x: 60, y: 1 },
];

const interpolate = (points, xValues) => {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const spline = new CubicSpline(xs, ys);

  return xValues.map((x) => {
    const y = spline.at(x);
    return { x, y };
  });
};

// Function to calculate the age in years
const calculateAge = (birthdate) => {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
};

// Define roughPlugin
const roughPlugin = {
  id: "roughPlugin",
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    const roughCanvas = rough.canvas(ctx.canvas);
    chart.data.datasets.forEach((dataset, index) => {
      const meta = chart.getDatasetMeta(index);
      meta.data.forEach((point, pointIndex) => {
        if (pointIndex < meta.data.length - 1) {
          const nextPoint = meta.data[pointIndex + 1];
          roughCanvas.line(point.x, point.y, nextPoint.x, nextPoint.y, {
            stroke: dataset.borderColor,
            strokeWidth: 2,
          });
        }
      });
    });
  },
};

const App = () => {
  const [birthMonth, setBirthMonth] = useState(3); // Default to April (0-indexed)
  const [birthYear, setBirthYear] = useState(2023); // Default to 2023
  const xValues = Array.from({ length: 500 }, (_, i) => i * (60 / 499));
  const interpolatedPoints = interpolate(dataPoints, xValues);

  const handleMonthChange = (event) => {
    setBirthMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setBirthYear(event.target.value);
  };

  const ageInYears = calculateAge(new Date(birthYear, birthMonth, 1));
  const interpolatedY = interpolate(dataPoints, [ageInYears])[0].y;

  const redPoint = { x: ageInYears, y: interpolatedY };

  const data = {
    labels: xValues,
    datasets: [
      {
        label: "Monotone Cubic Fit Curve",
        data: interpolatedPoints.map((p) => p.y),
        fill: false,
        backgroundColor: "black",
        borderColor: "black",
        pointBackgroundColor: "black",
        pointBorderColor: "black",
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 1, // Ensure the black line is drawn first
      },
      {
        label: "Selected Age",
        data: [{ x: redPoint.x, y: redPoint.y }],
        fill: true,
        backgroundColor: "red",
        borderColor: "red",
        pointBackgroundColor: "red",
        pointBorderColor: "red",
        pointRadius: 10,
        pointHoverRadius: 0,
        showLine: false,
        order: 2, // Ensure the red point is drawn on top
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        title: {
          display: true,
          text: "Child's Age (years)",
          font: {
            family: "Baloo",
            size: 18,
            weight: "bold",
          },
          color: "#333333",
        },
        ticks: {
          font: {
            family: "Varela Round",
            size: 14,
          },
          color: "#333333",
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "% Time Spent",
          font: {
            family: "Baloo",
            size: 18,
            weight: "bold",
          },
          color: "#333333",
        },
        ticks: {
          display: false,
          callback: function (value) {
            return `${value * 100}%`;
          },
          font: {
            family: "Baloo",
            size: 16,
            weight: "bold",
          },
          color: "#333333",
        },
        grid: {
          display: false,
        },
        min: 0,
        max: 1.2, // Elongate the y-axis
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
      roughPlugin: {}, // Enable the Rough.js plugin
    },
  };

  // Generate years for the last 60 years in descending order
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

  return (
    <div className="app-container">
      <h1 className="app-title">Together Time</h1>
      <div className="selector-container">
        <FormControl className="custom-form-control">
          <InputLabel
            id="month-label"
            className="custom-input-label"
          ></InputLabel>
          <Select
            labelId="month-label"
            value={birthMonth}
            onChange={handleMonthChange}
            className="custom-select"
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month, index) => (
              <MenuItem key={month} value={index} className="custom-menu-item">
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className="custom-form-control">
          <InputLabel
            id="year-label"
            className="custom-input-label"
          ></InputLabel>
          <Select
            labelId="year-label"
            value={birthYear}
            onChange={handleYearChange}
            className="custom-select"
          >
            {years.map((year) => (
              <MenuItem key={year} value={year} className="custom-menu-item">
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="chart-container">
        <Line data={data} options={options} plugins={[roughPlugin]} />
      </div>
      <p className="app-description">
        You've already spent{" "}
        <span className="highlight-percentage">{`${Math.round(interpolatedY * 100)}%`}</span>{" "}
        of the total time with your child (based on national averages).
      </p>
    </div>
  );
};

export default App;
