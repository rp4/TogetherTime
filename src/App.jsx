// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
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
import { 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Divider,
  Box,
  Paper
} from "@mui/material";
import EmailSubscription from "./EmailSubscription";
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
  { x: 144, y: 0.75 },
  { x: 216, y: 0.9 },
  { x: 360, y: 0.97 },
  { x: 720, y: 1 },
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

// Function to calculate the age in months
const calculateAgeInMonths = (birthdate) => {
  const today = new Date();
  const yearsDifference = today.getFullYear() - birthdate.getFullYear();
  const monthsDifference = today.getMonth() - birthdate.getMonth();
  return yearsDifference * 12 + monthsDifference;
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
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef(null);
  const xValues = Array.from({ length: 500 }, (_, i) => i * (720 / 499));
  const interpolatedPoints = interpolate(dataPoints, xValues);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Add resize observer to ensure chart resizes properly
  useEffect(() => {
    if (chartRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (chartRef.current && chartRef.current.current) {
          setTimeout(() => {
            if (chartRef.current && chartRef.current.current) {
              const chart = chartRef.current.current;
              if (chart) {
                chart.update('resize');
              }
            }
          }, 0);
        }
      });
      
      const chartContainer = document.querySelector('.chart-container');
      if (chartContainer) {
        resizeObserver.observe(chartContainer);
      }
      
      return () => {
        if (chartContainer) {
          resizeObserver.unobserve(chartContainer);
        }
        resizeObserver.disconnect();
      };
    }
  }, [chartRef.current]);

  // Add window resize event listener to update chart
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartRef.current.current) {
        chartRef.current.current.update();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMonthChange = (event) => {
    setBirthMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setBirthYear(event.target.value);
  };

  const ageInMonths = calculateAgeInMonths(new Date(birthYear, birthMonth, 1));
  const interpolatedY = interpolate(dataPoints, [ageInMonths])[0].y;

  const redPoint = { x: ageInMonths, y: interpolatedY };

  const data = {
    labels: xValues,
    datasets: [
      {
        label: "Monotone Cubic Fit Curve",
        data: interpolatedPoints.map((p) => p.y),
        fill: false,
        backgroundColor: "#444444",
        borderColor: "#444444",
        pointBackgroundColor: "#444444",
        pointBorderColor: "#444444",
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 1, // Ensure the black line is drawn first
      },
      {
        label: "Selected Age",
        data: [{ x: redPoint.x, y: redPoint.y }],
        fill: true,
        backgroundColor: "#e63946",
        borderColor: "#e63946",
        pointBackgroundColor: "#e63946",
        pointBorderColor: "#e63946",
        pointRadius: isMobile ? 6 : 10,
        pointHoverRadius: 0,
        showLine: false,
        order: 2, // Ensure the red point is drawn on top
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 100,
    onResize: function(chart, size) {
      // This ensures the chart redraws properly when resized
      chart.resize();
    },
    layout: {
      padding: {
        top: 10,
        right: 20,
        bottom: 10,
        left: 20
      }
    },
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        title: {
          display: true,
          text: "Child's Age (years)",
          font: {
            family: "Baloo",
            size: isMobile ? 18 : 28,
            weight: "bold",
          },
          color: "#333333",
        },
        ticks: {
          callback: function (value) {
            return value / 12; // Convert months to years
          },
          stepSize: isMobile ? 180 : 120, // Display fewer labels on mobile
          font: {
            family: "Varela Round",
            size: isMobile ? 12 : 16,
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
            size: isMobile ? 18 : 28,
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
            size: isMobile ? 12 : 16,
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
          >Birth Month</InputLabel>
          <Select
            labelId="month-label"
            value={birthMonth}
            onChange={handleMonthChange}
            className="custom-select"
            label="Birth Month"
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
          >Birth Year</InputLabel>
          <Select
            labelId="year-label"
            value={birthYear}
            onChange={handleYearChange}
            className="custom-select"
            label="Birth Year"
          >
            {years.map((year) => (
              <MenuItem key={year} value={year} className="custom-menu-item">
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <Paper elevation={0} className="chart-container">
        <Line ref={chartRef} data={data} options={options} plugins={[roughPlugin]} />
      </Paper>
      <p className="app-description">
        You've already spent{" "}
        <span className="highlight-percentage">{`${Math.round(interpolatedY * 100)}%`}</span>{" "}
        of the total time with your child (based on national averages). Remember
        to cherish every moment.
      </p>
      
      <Divider sx={{ margin: '30px 0', width: '80%', mx: 'auto' }} />
      
      <EmailSubscription birthMonth={birthMonth} birthYear={birthYear} />
      
      <div className="footer-link">
        <a href="https://dadyears.fun" target="_blank" rel="noopener noreferrer">@DadYears</a>
      </div>
    </div>
  );
};

export default App;
