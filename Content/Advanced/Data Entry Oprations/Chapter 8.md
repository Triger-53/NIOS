I would be pleased to provide you with a detailed lesson on **Formulas, Functions, and Charts** in MS Excel 2007, drawing upon the provided source material. This lesson covers how to perform calculations and how to visually represent your data.

***

## 1. Formulas and Functions

### 1.1 What are Formulas?

Formulas are essential for manipulating data and extracting useful information from Excel worksheets. Formulas specify the mathematical relationship between numbers. They are used for simple operations like addition, subtraction, multiplication, and division, as well as for complex calculations.

A key feature of formulas in Excel is **automatic calculation**: when there is a change in the data, the formulas automatically calculate the updated results without extra effort from the user.

**Elements of a Formula**
A formula can include any or all of the following elements:
*   It **must begin with the 'equal to' (=) sign**.
*   Mathematical operators, such as **+ (for addition)** and **/** (for division), and logical operators such as **<** (less than) and **>** (greater than).
*   References of cells (including named ranges and cells).
*   Text or Values.
*   Functions related to the worksheets, such as **SUM** or **AVERAGE**.

When you enter a formula, the current cell displays the result after the formula is entered. If you select a cell containing a formula, the formula itself appears in the **Formula bar**.

**Excel 2007 Feature:** Excel 2007 introduced a new feature allowing you to create formulas that use **column names from a table**, making formulas much easier to read.

### 1.2 Examples of Formulas

Here are examples illustrating how formulas are used, assuming A1 = 2, B1 = 3, C1 = 4, and D1 = 5:
*   **= B1 \* C1** will result in 3 \* 4 = 12.
*   **= A1 \* B1 – C1 + D1** will result in 2 \* 3 – 4 + 5 = 7.
*   **= ((A1 \* B1) + C1)/D1** will result in ((2 \* 3) + 4) / 5 = 2.

### 1.3 Functions

**Functions** are pre-built formulas. Users only need to provide cell references and addresses, which are called **arguments** of the function and are given between parentheses (e.g., `SUM(B3:E3)`).

In Excel 2007, formulas and functions are available in the **Formulas Tab**. If you click on this tab, the corresponding ribbon displays the available formulas.

#### Using AutoSum Feature

The sum of cell values can be performed quickly using the **AutoSum** feature:
1.  Select the desired cell (e.g., F3).
2.  Select the **Formulas tab**.
3.  Click **AutoSum** from the function library group.
4.  Select **Sum**.
5.  Press **Enter**.

Alternatively, you can write the function directly, for example: **= SUM(B3:E3)**, in cell F3 to get the sum of marks from cells B3 through E3.

#### Copying a Formula

You can copy a formula (like a summation formula) to adjacent cells by using the **drag handle** (also known as the fill handle) and dragging it down to cover the remaining cells in the column. This automatically copies the formula and calculates the corresponding results for the respective rows.

#### Common Functions

Apart from `SUM`, other available functions include `AVERAGE`, `Count Numbers`, `MAX`, and `MIN`.

| Function | Description | Syntax |
| :--- | :--- | :--- |
| **SUM()** | Adds all the numbers in a range of cells. | `SUM(number1, number2, ...)` |
| **SUMIF()** | Used to add the cells with respect to a given **criteria**. | `SUMIF(range, criteria, sum_range)` |
| **AVERAGE()** | Returns the arithmetic mean of the arguments. | `AVERAGE(number1, number2, ...)` |
| **MIN()** | Returns the smallest number in a set of values. | `MIN(number1, number2, ...)` |
| **MAX()** | Returns the largest number in a set of values. | `MAX(number1, number2, ...)` |

*Note: All these functions can accept a maximum of 255 arguments.*

**SUMIF Detailed Explanation:**
*   **Range:** A group of adjacent cells containing numbers or names, arrays, or references with numbers. Blank and text values are ignored.
*   **Criteria:** Defines which cells will be considered for the addition (e.g., a number, expression, or text like `">12"` or `"mangoes"`).
*   **Sum\_range:** The actual cells to be added if their corresponding cells in the *range* match the *criteria*. If `sum_range` is avoided, the cells in *range* are both evaluated and added if they match the criteria.

#### Accessing More Functions

If you need a function not listed in the quick selection, follow these steps:
1.  Select the **Formula Tab**.
2.  Choose **AutoSum** from the function library group.
3.  Click on **More Functions…**.
A dialog box will appear, allowing you to choose a function as per your need.

***

## 2. Charts and Graphics

### 2.1 What are Charts?

**Charts** allow you to present data entered into the worksheet in a **visual format** using a variety of graph types. Formatted charts come in various types for diverse goals, ranging from columns to pies, from lines to surfaces.

### 2.2 Types of Charts in Excel 2007

Excel 2007 provides various chart types to help display data in different ways. You can create a new chart or change an existing one from the wide range of subtypes available.

| Chart Type | Primary Use/Description | Data Arrangement | Key Characteristics |
| :--- | :--- | :--- | :--- |
| **Column Charts** | Used to compare values across categories; effective for analyzing data of the same category on a defined scale. | N/A | Compare values across categories. |
| **Line Charts** | Used to display **continuous data over time** with respect to a common scale. Best for viewing **data trends** at equal time intervals. | Columns or rows. | Horizontal axis (category), Vertical axis (value). |
| **Pie Charts** | Shows the **relative proportions** or contributions to a whole. | Only **one data series** is used. | Values must be all positive (negatives converted to positive). Maximum five or six slices recommended for easy interpretation. |
| **Bar Charts** | Used to show **comparisons between individual items**. | Rows and columns. | Used for comparison. |
| **Area Charts** | Used to highlight the **degree of a change over time** and draw attention to the **total value** across a trend. | Rows or columns. | Highlight magnitude of change. |
| **XY (Scatter) Charts** | Used to show the relationship among two variables. **Both axes display values** (no category axis). | N/A | Show relationships between two variables. |
| **Stock Charts** | Demonstrates **fluctuations** (e.g., stock market prices or scientific data like temperature). | Columns or rows in a **particular order** (e.g., High, Low, Closed headings). | Requires data to be arranged in a specific order. |
| **Surface Charts** | Useful where both categories and data series are **numeric values**; helps find optimum combinations among two data sets. | Columns or rows. | Colors/patterns indicate areas in the same range of values (like a topographic map). |
| **Doughnut Charts** | Illustrates the relationship of parts to a whole, similar to a pie chart, but can use **more than one data series**. | Rows or columns. | Relationship of parts to a whole (multiple series). |
| **Bubble Charts** | Plots data where **x values** are in the first column and matching **y values** and **bubble size values** are in adjacent columns. | Columns. | Shows three data variables (X, Y, and Size). |
| **Radar Charts** | Compares the **aggregate values** of a number of data series. | Columns or rows. | Aggregate value comparison. |

### 2.3 Components of a Chart

A comprehensive chart includes several labeled elements:

| Component | Description |
| :--- | :--- |
| **Chart Title** | A title given to the entire chart. |
| **X-Axis Title** | A title given to the X-axis data range. |
| **Y-Axis Title** | A title given to the Y-axis data range. |
| **X-Axis Category** | The categories of the plotted data, usually taken from the first column or row of the data range. |
| **Y-Axis Value** | The data range marked to plot the data series. |
| **Data Labels** | The actual values of the data series plotted. |
| **Legends** | Specifies the **colour, symbol, or pattern** used to mark data series. |
| **Tick Mark** | Used to show the scaling of the X-axis and Y-axis. |
| **Grid Lines** | Displays lines at the major intervals on the category (x) axis and/or Y-axis. |

### 2.4 Drawing a Chart in Excel 2007 (The Ribbon Approach)

In Excel 2007, the traditional Chart Wizard is replaced by the **Ribbon** interface. The buttons on the **Insert tab** are the starting point for creating a chart.

**General Steps to Draw a Chart:**

1.  **Enter data** in the worksheet.
2.  **Select the data range** by highlighting the range you want to use.
3.  Click the **Insert Tab** and select a chart type (e.g., Column, Line, Pie) from the **Chart group**.
4.  Select the **sub type** of chart (e.g., 3-D Clustered Column).

Once a chart is created, the **Chart Tools** are displayed on the Ribbon, adding three tabs: **Design, Layout, and Format**.

**Customizing the Chart (Using Layout Tab):**

*   **Chart Title:** Click the **Layout tab $\rightarrow$ Labels group $\rightarrow$ Chart Title** option. Then click on the chart title box and write your title.
*   **Axis Titles:**
    *   For the X-axis, click **Layout tab $\rightarrow$ Labels Group $\rightarrow$ Axis Titles $\rightarrow$ Primary Horizontal Axis Title**. Click on the Axis Title and write the X-axis title.
    *   Follow the same steps for the Y-axis.
*   **Changing Legend Position:** Click **Layout tab $\rightarrow$ Labels Group $\rightarrow$ Legend** option, and choose a position.
*   **Changing Data Label Position:** Click **Layout tab $\rightarrow$ Labels Group $\rightarrow$ Data Label** option, and choose a format to display data labels.
*   **Showing Data Tables:** Click **Layout tab $\rightarrow$ Labels Group $\rightarrow$ Data Table** option, and choose a style (with or without legend keys).
*   **Hiding/Unhiding Grid Lines:** Click **Layout tab $\rightarrow$ Axis Group $\rightarrow$ Gridlines**. Choose **Primary Horizontal Grid Lines** or **Primary Vertical Grid Lines** and select an appropriate style (None, Major Gridlines, Minor Gridlines, Major and Minor Gridlines).

**Editing and Managing Charts:**

*   **Resizing:** Click on the chart's border and **drag any of the eight black handles** to change the size. Corner handles resize proportionally; handles along the lines stretch the chart.
*   **Moving:** Select the chart's border, hold the left mouse button, and **drag the chart to a new location**. Elements like titles and labels can also be moved within the chart by clicking to activate and dragging.
*   **Copying to Word/PowerPoint:** Select the chart, click **Copy**, open the destination document (Word or PowerPoint), and click **Paste**.

***

## 3. AutoShapes and SmartArt Graphics

### 3.1 AutoShapes

The **AutoShapes** feature allows you to draw geometrical shapes, arrows, flowchart elements, stars, and more on the worksheet.

**Steps to use AutoShapes:**
1.  Click on the **Insert Tab**.
2.  From the **Illustrations Group**, click on **Shapes**.
3.  Select the shape you want to insert (e.g., a square or arrow).

**Categories of AutoShapes include**:
*   **Lines:** Used to draw straight lines, arrows, curved lines, or freeform shapes.
*   **Connectors:** Lines used to connect flowchart elements.
*   **Basic Shapes:** Includes two- and three-dimensional shapes, icons, braces, and brackets. These can be resized using **open box handles** and adjusted using **yellow diamond handles**.
*   **Block Arrows:** Used to choose from many types of two- and three-dimensional arrows.
*   **Flow Chart:** Used to add specific elements for creating a flowchart.
*   **Stars and Banners:** Used for stars, bursts, banners, and scrolls.
*   **Call Outs:** Includes speech and thought bubbles, allowing you to enter text within the call out.

### 3.2 SmartArt Graphics

**SmartArt Graphics** are visual representations of information and ideas used for quick, easy, and effective communication. This facility is available in MS Excel 2007.

To create SmartArt, you choose a type (e.g., Process, Cycle, Hierarchy, or Relationship).

**Steps to Create SmartArt:**
1.  Click on the **Insert Tab**.
2.  From the **Illustrations Group**, click on **SmartArt**.
3.  Choose a category (e.g., Hierarchy) and click **OK**.
4.  Enter values by clicking on the component where you want to enter text.
You can apply different effects to the SmartArt using the **Design tab** that becomes visible when the graphic is selected. SmartArt graphics can be copied and pasted as images into other programs like Word and PowerPoint.

### 3.3 Adding Clip Art and Pictures

**Clip Art** is a single media file, including sound, animation, art, or a movie.

**Steps to insert Clip Art:**
1.  Click on the **Insert Tab**.
2.  From the **Illustrations Group**, click **Clip Art**.
3.  Select a Collection and press the **Go Button**.
4.  Click on a clip from the collection, and it will be inserted into the worksheet.

To edit the clip, click on it to display the **Format tab**, which allows you to make necessary changes.

**Inserting and Editing a Picture from a File:**
1.  Click on the **Insert Tab**.
2.  From the **Illustrations Group**, click **Picture**.
3.  Select a picture from its stored location and press **Enter** or click the **Insert button**.
4.  The picture is added to the sheet. Clicking the picture activates the **Format tab**, with groups like **Adjust, Picture Styles, Arrange, and Size**, to change the picture's appearance.