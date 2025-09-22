# London Crime Data Stream Processing

## Problem Statement

Given a large dataset of London crime records (CSV format), the task is to build a Node.js stream processing script that analyzes the data and answers the following questions:

1. **Did the number of crimes go up or down over the years?**
2. **What are the most dangerous areas of London?**
3. **What is the most common crime per area?**
4. **What is the least common crime?**

## Solution Overview

This project uses Node.js streams to efficiently process the `london-crime-data.csv` file without loading the entire dataset into memory. The main script is `dataset-analysis.js`, which leverages the `csv-parser` package and custom Transform streams to answer each question in a memory-efficient, scalable way.

### How the Solution Works

- **Streaming CSV Parsing:**
  - The script reads the CSV file as a stream and parses each row into a JavaScript object using `csv-parser`.
  - A `PassThrough` stream is used to broadcast each parsed row to multiple analysis pipelines simultaneously.

- **Specialized Transform Streams:**
  - Four custom Transform streams are created, each dedicated to answering one of the questions above.
  - Each Transform stream aggregates relevant statistics as data flows through:
    - **Yearly Crime Trends:** Aggregates crime counts per year to show trends over time.
    - **Most Dangerous Areas:** Counts crimes per borough to identify the top 5 most dangerous areas.
    - **Most Common Crime per Area:** Tracks the most frequent crime type for each borough.
    - **Least Common Crime:** Finds the crime type with the lowest occurrence overall.
  - Results are printed to the console when processing is complete.

### Notes
- The solution is designed for large datasets and will work efficiently even with millions of records.
- All results are output to the console.

---

*This project demonstrates practical use of Node.js streams for real-world data analysis tasks.*
