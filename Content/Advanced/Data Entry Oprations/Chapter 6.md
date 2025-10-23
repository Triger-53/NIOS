I'd be pleased to provide you with a full, detailed lesson on **Spreadsheets**, specifically focusing on **MS Excel 2007** fundamentals, drawing from the provided source material.

***

## 1. Introduction to Spreadsheets (MS Excel)

### 1.1 What is a Spreadsheet?

A spreadsheet is essentially a large sheet of data and information organized neatly in **rows and columns**. **MS Excel** is one of the most widely used spreadsheet applications and is part of the Microsoft Office suite.

Spreadsheets are extremely useful for:
*   Entering, editing, analyzing, and storing data.
*   Performing arithmetic operations with numerical data (like addition, subtraction, multiplication, and division).
*   Sorting numbers or characters based on criteria (e.g., ascending or descending order).
*   Using simple financial, mathematical, and statistical formulas.

### 1.2 Objectives of this Lesson

By the end of this lesson, you should be able to:
*   Explain the basic features of MS Excel 2007.
*   Set up pages and manage their printing.
*   Modify a worksheet.
*   Enter and edit data in a worksheet.
*   Work on keyboard shortcuts.

***

## 2. Key Features of Spreadsheets

Excel offers numerous features to simplify complex tasks.

| Feature | Description |
| :--- | :--- |
| **AutoSum** | Helps you quickly add the contents of a cluster of adjacent cells. |
| **AutoFill** | Allows you to quickly fill cells with repetitive or sequential data (like chronological dates or numbers, or repeated text). It can also be used to copy functions and alter text/numbers. |
| **List AutoFill** | Automatically extends cell formatting when a new item is added to the end of a list. |
| **AutoShapes** | This toolbar allows you to draw geometrical shapes, arrows, flowchart elements, stars, and more, which can be used to draw your own graphs. |
| **Wizard** | Guides you by displaying helpful tips and techniques based on the task you are performing. |
| **Drag and Drop** | Helps you reposition data and text simply by dragging the data with the mouse. |
| **Charts** | Helps in presenting a **graphical representation** of your data in forms such as Pie, Bar, and Line charts. |
| **PivotTable** | Flips and sums data quickly, allowing you to perform data analysis and generate reports (like financial statements or statistical reports). It can also graphically analyze complex data relationships. |
| **Shortcut Menus** | Appropriate commands for the current task appear when you click the right mouse button. |

### 2.1 Specific Features of MS Excel 2007

Excel 2007 introduced significant improvements:

*   **Results-oriented User Interface:** Commands previously hidden in complex menus are now easier to find on **task-oriented tabs** (like the **Ribbon** interface we discussed previously) that contain logical groups of commands. Many dialog boxes are replaced with drop-down galleries displaying available options, often with descriptive tooltips or sample previews.
*   **Increased Limits:** The grid size is vastly expanded, offering **1,048,576 rows and 16,384 columns** (1,500% more rows and 6,300% more columns than Excel 2003). The last column is XFD (instead of IV). The number of cell references per cell is increased to the maximum available memory, and the types of formatting are unlimited in a workbook.
*   **Themes and Styles:** You can quickly format data using a **theme**, which is a predefined set of colours, lines, fonts, and fill effects. Themes can be applied to specific items (like charts) or the entire workbook and can be shared across other Office 2007 releases (Word, PowerPoint). **Styles** are predefined theme-based formats that can be applied to charts, tables, PivotTables, diagrams, or shapes.
*   **Rich Conditional Formatting:** This feature makes it easy to observe relationships in data, aiding analysis. It allows you to implement conditional formatting rules that apply rich visual formatting (data bars, gradient colors, and icon sets) to data that meets those rules.
*   **Easy Formula Writing:**
    *   **Resizable Formula Bar:** The formula bar automatically resizes to accommodate complex, long formulas.
    *   **Function AutoComplete:** This feature detects functions you want to use, helping you write proper formula syntax more quickly.
    *   **Structured References:** Excel 2007 allows using **structured references** to refer to named ranges and tables in a formula, in addition to standard cell references (like D1 or A1C1).
*   **Improved Sorting and Filtering:** You can sort data by color and by more than 3 levels. Filtering options include filtering by color, by dates, displaying more than 1000 items in the AutoFilter drop-down list, and selecting multiple items to filter.

***

## 3. Starting Excel and Understanding the Worksheet

### 3.1 Starting Excel

There are two primary ways to start MS Excel 2007:

1.  **Using the Start Menu:** Click **Start $\rightarrow$ All Programs $\rightarrow$ Microsoft Office $\rightarrow$ Microsoft Excel 2007**.
2.  **Using the Run Menu:** Type `excel` in the `open` text box and click **OK**.

### 3.2 The Excel Worksheet Structure

An Excel file is called a **Workbook**, and it can hold many **Worksheets**. The worksheet is essentially a grid defined by columns and rows.

*   **Columns:** Designated by **letters** (A, B, C...).
*   **Rows:** Designated by **numbers** (1, 2, 3...).
*   **Cell:** The intersection of a column and a row.
*   **Cell Address/Reference:** Each cell has a unique address defined by the column letter followed by the row number (e.g., A8 refers to the cell in Column A and Row 8).
*   **Cell Contents:** Cells can contain text, numbers, or mathematical formulas.

### 3.3 Managing Worksheets

By default, every new workbook includes **three worksheets**. These are accessible via **worksheet tabs** just above the status bar.

| Action | Method |
| :--- | :--- |
| **Insert New Worksheet (at the end)** | Click the **Insert Worksheet tab** (encircled with a blue circle in the interface). |
| **Insert New Worksheet (before existing)** | Select the existing worksheet $\rightarrow$ **Home tab $\rightarrow$ Cells Group $\rightarrow$ Insert $\rightarrow$ Insert Sheet**. Alternatively, **Right-click** on the existing sheet tab and select **Insert Option** from the Pop Up Menu. |
| **Rename a Worksheet** | **Right-click** on the worksheet tab $\rightarrow$ Select **Rename** from the Pop Up menu $\rightarrow$ Type the new name. |

***

## 4. Data Entry and Editing

### 4.1 Selecting Cells and Ranges

To enter data, you must first select a cell or range.

*   **Active Cell:** When you open Excel, cell A1 is typically active, indicated by a **darker border** around it.
*   **Selecting a Single Cell:** Move the mouse pointer to the desired cell and click (using the right button as per the source, though typically the left button is used to activate a cell).
*   **Selecting a Range of Cells (Adjacent):** Click on one cell, hold down the **left mouse button**, and drag the mouse pointer to the last cell of the desired range.
*   **Selecting a Range of Cells (Using Name Box):** Go to the **Name Box**, type the range (e.g., A1:C5), and press **Enter**. All cells in that range will be selected.

### 4.2 Navigating the Worksheet

You can move around the worksheet using various methods:
*   **Scrollbars:** Use the vertical scrollbar for rows and the horizontal scrollbar for columns. Dragging the thumb tab displays a Screen Tip identifying the row or column you are advancing to.
*   **Mouse/Arrow Keys:** Click any cell or use the **arrow keys** to move between cells. The cell you move to becomes the active cell.
*   **Scrolling/Zooming:** Some mouse devices (like Microsoft IntelliMouse) have built-in scrolling and zooming capabilities.

### 4.3 Types of Data Entry

You can enter different kinds of data into a cell:
1.  **Numbers:** Can be whole numbers (e.g., 25), decimals (e.g., 25.67), or scientific notation (e.g., 0.2567E+2).
    *   If a number is too long to be viewed, Excel displays scientific notation or number signs (**\# \# \# \# \# \#**). Widening the column resolves this.
2.  **Text:** Select the cell, type the text, and press **ENTER**. The text appears in the active cell and the **Formula bar**.
    *   To treat numbers as text (preventing calculations), use an **apostrophe (‘)** as the first character.
3.  **Date and Time:** Excel converts these entries into **serial numbers** kept as background information, but displays the date/time in your selected format.
4.  **Data in Series:** Use **AutoFill** to fill a range of cells with the same value or a series of values.

### 4.4 Editing Data

You can easily edit data in a cell using several methods:
1.  Select the cell, press **F2**, use the Backspace key to erase the wrong entry, and retype the correction.
2.  Select the cell and simply **retype** the correct entry (this replaces the old data).
3.  To clear the contents, select the cell and press the **Delete key**.
4.  To undo the previous entry, click the **Undo button** (on the standard Toolbar) or use the keyboard shortcut **CTRL+Z**.

### 4.5 Find and Replace

You can locate and potentially modify data using the Find and Replace features:
*   To find data: Use **Home Tab $\rightarrow$ Find**.
*   To locate and replace data: Use **Home Tab $\rightarrow$ Find $\rightarrow$ Replace**.

***

## 5. Modifying a Worksheet: Structure and Content

### 5.1 Inserting and Deleting Cells, Rows, and Columns

You can modify the worksheet structure to add or remove space for data.

| Action | Steps |
| :--- | :--- |
| **Insert Blank Cells** | Select the range of cells where you want the new cells (select the same number of cells you wish to insert) $\rightarrow$ **Home tab $\rightarrow$ Cells group $\rightarrow$ Insert $\rightarrow$ Insert Cells**. |
| **Insert Rows** | Select the row(s) **above** which you want to insert the new row(s) $\rightarrow$ **Home tab $\rightarrow$ Cells group $\rightarrow$ Insert $\rightarrow$ Insert Sheet Rows**. |
| **Insert Columns** | Select the column(s) **immediately to the right** of where you want to insert the new column(s) $\rightarrow$ **Home tab $\rightarrow$ Cells group $\rightarrow$ Insert $\rightarrow$ Insert Sheet Columns**. |
| **Delete Cells/Rows/Columns** | Select the item(s) to delete $\rightarrow$ **Home tab $\rightarrow$ Cells group $\rightarrow$ Delete** $\rightarrow$ Click the appropriate option (**Delete Cells, Delete Sheet Rows,** or **Delete Sheet Columns**). |

### 5.2 Resizing Rows and Columns

You can adjust the width of columns and the height of rows.

| Action | Steps (Using Ribbon Commands) |
| :--- | :--- |
| **Set Column to Specific Width** | Select column(s) $\rightarrow$ **Home tab $\rightarrow$ Cells group $\rightarrow$ Format $\rightarrow$ Column Width** $\rightarrow$ Type the desired value. |
| **Autofit Column Width** | Select column(s) $\rightarrow$ **Home tab $\rightarrow$ Cells group $\rightarrow$ Format $\rightarrow$ AutoFit Column Width**. (Quickly Autofit all columns: Click the **Select All button**, then **double-click** any boundary between two column headings). |
| **Change Width by Mouse** | Drag the boundary on the right side of the column heading until the desired size is reached. To autofit quickly, double-click the boundary to the right of the column heading. |
| **Set Row to Specific Height** | Select row(s) $\rightarrow$ **Home tab $\rightarrow$ Cells group $\rightarrow$ Format $\rightarrow$ Row Height** $\rightarrow$ Type the desired value. |
| **Autofit Row Height** | Select row(s) $\rightarrow$ **Home tab $\rightarrow$ Cells group $\rightarrow$ Format $\rightarrow$ AutoFit Row Height**. (Quickly Autofit all rows: Click the **Select All button**, then **double-click** the boundary below one of the row headings). |

### 5.3 Moving and Copying Cells (Including Contents/Formatting)

When moving or copying a cell, Excel includes the entire cell: formulas, resulting values, cell formats, and comments.

| Action | Method (Using Ribbon/Keyboard) |
| :--- | :--- |
| **Move Cells** | Select cells $\rightarrow$ **Home tab $\rightarrow$ Clipboard group $\rightarrow$ Cut (CTRL+X)** $\rightarrow$ Select upper-left cell of paste area $\rightarrow$ **Paste (CTRL+V)**. |
| **Copy Cells** | Select cells $\rightarrow$ **Home tab $\rightarrow$ Clipboard group $\rightarrow$ Copy (CTRL+C)** $\rightarrow$ Select upper-left cell of paste area $\rightarrow$ **Paste (CTRL+V)**. |
| **Move Cells (Drag-and-Drop)** | Select cells $\rightarrow$ Point to the border (pointer becomes a move pointer) $\rightarrow$ Drag to new location. |
| **Copy Cells (Drag-and-Drop)** | Select cells $\rightarrow$ Hold down **CTRL** while pointing to the border (pointer becomes a copy pointer) $\rightarrow$ Drag to new location. |
| **Copy Values Only** | Select and Copy cells $\rightarrow$ Select paste area $\rightarrow$ **Home tab $\rightarrow$ Paste arrow $\rightarrow$ Paste Values** [4. |
| **Move Cells (Drag-and-Drop)** | Select cells $\rightarrow$ Point to the border (pointer becomes a move pointer) $\rightarrow$ Drag to new location. |
| **Copy Cells (Drag-and-Drop)** | Select cells $\rightarrow$ Hold down **CTRL** while pointing to the border (pointer becomes a copy pointer) $\rightarrow$ Drag to new location. |
| **Copy Values Only** | Select and Copy cells $\rightarrow$ Select paste area $\rightarrow$ **Home tab $\rightarrow$ Paste arrow $\rightarrow$ Paste Values**. |
| **Copy Formats Only** | Select and Copy cells $\rightarrow$ Select paste area $\rightarrow$ **Home tab $\rightarrow$ Paste arrow $\rightarrow$ Paste Special $\rightarrow$ Formats**. |
| **Copy Formulas Only** | Select and Copy cells $\rightarrow$ Select paste area $\rightarrow$ **Home tab $\rightarrow$ Paste arrow $\rightarrow$ Formulas**. |

***

## 6. Page Layout and Printing

### 6.1 Freeze Panes

If you have a large worksheet, column and row headings will disappear when you scroll. The **Freeze Panes** feature keeps them visible.

1.  Click the label of the row **below** the row that should remain frozen.
2.  Select **View Tab $\rightarrow$ Window Group $\rightarrow$ Freeze Panes $\rightarrow$ Freeze Panes**.
3.  To remove them: **View Tab $\rightarrow$ Window Group $\rightarrow$ Freeze Panes $\rightarrow$ Unfreeze Panes**.

### 6.2 Page Breaks

You can manually set where a new page should start:
1.  Select the row you want to appear just **below** the page break.
2.  Choose **Page Layout $\rightarrow$ Setup Group $\rightarrow$ Breaks $\rightarrow$ Input Page Break**. Excel starts a new page from the selected row.

### 6.3 Page Setup (Margins, Orientation, Scaling)

Page formatting options are found in the **Page Setup** menu.

*   **Orientation:** Under the **Page tab**, you can set the page to **Landscape** (horizontal) or **Portrait** (vertical).
*   **Scaling:** You can format the size of the worksheet on the printed page. To force a worksheet to print only one page wide (so all columns fit), select **Fit to 1 page(s) wide**.
*   **Margins:** Change top, bottom, left, and right margins by selecting **Margins** from the **Page Layout Tab**. You can also enter values for header and footer positions, and choose to center the output horizontally or vertically.
*   **Sheet Options:** Under the **Sheet tab**, you can select the specific range of cells to be printed. Check the **Gridlines** box if you want the cell dividers to appear in the printout. If the worksheet spans multiple pages, use **Rows to repeat at top** to select a title row that will be printed at the top of every page.

### 6.4 Headers and Footers

Headers (top margin) and footers (bottom margin) can be added to every page.

1.  On the **Insert tab $\rightarrow$ Text group $\rightarrow$ Header & Footer**.
2.  Click the left, center, or right text box at the top (header) or bottom (footer) of the page to add or change text.

### 6.5 Print Preview and Printing

**Print Preview** helps you view the worksheet before printing, allowing for necessary edits.

*   **To view Print Preview:** Select **Print** from the **Office Button** $\rightarrow$ Click **Print Preview**. You can use the Zoom button to view pages closer, or the Page Setup button to make modifications.
*   **To Print:** Select **Print** from the **Office Button**.
    *   You can select the **Print Range** (all pages or a specific range).
    *   You can choose **Print What** (selection of cells, active worksheet, or entire workbook).
    *   You can set the **number of Copies** and check the **Collate** box if pages should remain in order.

***

## 7. File Management and Protection

### 7.1 Saving and Closing Files

*   **Saving (First Time):** Click **Office Button $\rightarrow$ file save as** $\rightarrow$ Select location $\rightarrow$ Type file name $\rightarrow$ Click **Save**.
*   **Saving (Subsequent Times):** Click the **‘file save’ icon** or **Office Button $\rightarrow$ save** (or use CTRL+S).
*   **Closing File:** Select **Close Command** from the Office Button menu.
*   **Exiting Excel:** Select **Exit Excel Command** from the Office Button menu.

### 7.2 Workbook Protection

You can protect your workbook with a password to control who can view or modify the file.

1.  Click **Microsoft Office Button $\rightarrow$ Save As**.
2.  Click **Tools**, then click **General Options**.
3.  Set passwords:
    *   **Password to open:** Reviewers must enter this to view the workbook.
    *   **Password to modify:** Reviewers must enter this to save changes.
4.  Optional: Select the **Read-only recommended** check box. Reviewers will be asked if they want to open the file as read-only, preventing accidental modification.
5.  Click **OK**, retype and confirm passwords, and click **Save**.

If a document is protected, the command name for managing this protection changes to **Unprotect workbook**.