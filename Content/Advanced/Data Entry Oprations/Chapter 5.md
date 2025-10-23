Welcome to this next detailed lesson! Based on the source material, this section will teach you about **Mail Merge** in MS Word 2007, a powerful feature used for mass customization of documents like letters, labels, and envelopes.

***

## 1. Introduction to Mail Merge

### 1 a powerful feature used for mass customization of documents like letters, labels, and envelopes.

***

## 1. Introduction to Mail Merge

### 1.1 What is Mail Merge?

Mail Merge is a common word processing task that helps you produce **periodic mailings** to send to different people or agencies connected to your business or profession. The main goal is to organize address data, incorporate it into a document, and print it out in a desired personalized format.

### 1.2 Main Uses and Objectives

The primary uses of Word’s Mail Merge features include:

*   Merging a list of names and addresses into a **single letter** that can be personalized and sent to different people.
*   Creating categories, a single letter with **variable information fields** in it, or labels.
*   Producing merged documents such as **directory lists, invoices, print address lists, or printing addresses on envelopes and mailing labels**.

The learning objectives of this lesson are to enable you to create form letters, mailing labels, and envelopes; organize address data and merge it into a generic document; and print the resulting personalized documents.

### 1.3 Key Documents in Mail Merge

Mail Merge requires three specific types of documents:

1.  **Main Document:** This is the **personalized document** (e.g., a standard letter, envelope, or mailing label). It contains the text and graphics that **remain the same** for every version of the merged document (e.g., the body of the form letter and the return address).
2.  **Data Source:** This file contains the names and addresses or any other information that will **vary** with each version of the mail-merge document. For instance, a list of client names and addresses for a form letter.
3.  **Merge Document:** This is the **third document produced** when the main document is combined with the data source. The merge document is created by inserting data or information from the data source into the main document. For example, inserting the merge field $<<City>>$ in a letter will cause Word to insert a city name like "New Delhi" from the data field.

## 2. Accessing and Using the Mailings Feature

In Word 2007, the Mail Merge feature is available in the **Main Tab bar**.

1.  Click on the **‘Mailings’ tab** on the main tab bar to activate the mailings features and tools.
2.  These features are organized into subtasks, including “Create,” “Start Mail Merge,” “Write & Insert Fields,” “Preview Results,” and “Finish & Merge”.

### 2.1 The Mail Merge Wizard

The **Mail Merge Wizard** is a guided tool that takes you through the entire process. It involves creating and editing the main document, creating or opening a data file, and merging the data fields with the main document.

To use the Wizard, select **Mailings $\rightarrow$ Start Mail Merge** subtask from the main tab bar, and then select the **Step by Step Mail Merge Wizard** option. The Wizard has 6 steps to create a mail merge document.

## 3. Step 1: Selecting the Document Type

The first step is selecting the type of document you are creating. You can choose from:

*   **Letters** (most common document type)
*   **E-Mail Messages**
*   **Envelopes**
*   **Labels**
*   **Directory**

After selecting the document type (e.g., Letters), click on **“Next: Starting document”** at the lower end of the Wizard dialog box to move to Step 2.

## 4. Step 2: Selecting the Starting Document

This step involves choosing how you want to set up your main document. There are three options:

1.  **Use the current document:** This is suitable if you already have the letter drafted and only need to add recipient information using Mail Merge features.
2.  **Start from a Template:** If you do not have a drafted letter, you can use ready-to-use mail merge templates available in Word 2007, which can be customized.
3.  **Start from existing document:** You can select an existing mail merge document and make necessary changes to the content or recipients.

For customized letters, you might select **"Start from a Template"** and choose a **"Blank Document"**. You should leave space (approximately 6 to 7 lines) at the top of the letter to insert address fields later; do not type anything in this space. Once the body of the letter is typed, save your document.

## 5. Step 3: Creating a Data Source (Recipient List)

Step 3 requires selecting a list of recipients (addresses) to whom the drafted letter will be sent.

### Creating a New Data Source

If you do not have existing database information, you must create a new data source containing the fields of information needed for the main document (e.g., Name, Address1, City, State, PIN Code).

To create a new list using the Wizard:
1.  Select **“Type a new list”** from the **“Select Recipients”** dialog box in step 3.
2.  Select the **“Create”** option.
3.  A dialog box appears with standard fields (like Title, First Name, Last Name, Company Name).
4.  You can directly enter data into these fields.
5.  **Customizing Columns:** If you need to remove, add, or rename fields, click the **Customise Columns** button. Once customization is complete, click **OK**.
6.  The **Save As dialog box** appears. Save the file in the desired folder with a file name; the file will be saved with an extension name `.mdb` (Microsoft Database).

### Using an Existing Data Source

You can use various data file formats as a data source, including **Access databases, Excel files, Word files, and Rich Text format**.

1.  Select **“Use an existing list”** option from the Select Recipients dialog box.
2.  Click **“Browse”** to display the Select Data Source dialog box, locate your stored data file, and click **Open**.
3.  Based on the file type, Mail Merge may ask you to define how to distinguish between data fields and data records.
4.  Once loaded, click **Edit Recipient List** to make changes. You can locate records using arrow keys, typing the record number, or clicking **Find**.

### Alternative Data Source Creation Methods

*   **Word Table:** You can manually create a data source by inserting a table (**Insert $\rightarrow$ Table** command). Type the **data field names** on the top row and the data records starting from the second row, then save the table as a Word document.
*   **Excel Worksheet:** Start Excel, type the data field names on the top row of the worksheet, and data records starting from the second row. Save the worksheet, then copy the data field names and data records. Paste this data into a new Word document (it will appear as a table) and save the document; this is your data source.

## 6. Steps 4 & 5: Inserting Merge Fields and Merging Data

Once the main document and data source are ready, the next steps involve inserting merge fields and merging the data.

### Inserting Merge Fields (Step 4)

1.  Click on the exact location in your letter where the address (or variable information) should appear.
2.  Select **Address Book** option (or appropriate field option) in step 4 of the Wizard.
3.  Using **Insert Address Block**, you can select the individual address fields to be inserted into the main letter.
4.  After inserting all the merge fields, save the main document using **Office Button $\rightarrow$ Save As $\rightarrow$ Word Document** (or other format). This document will now function as the merge document.

### Previewing and Completing the Merge (Step 5)

This is the last step of the Mail Merge Wizard.

*   Click on the **$<<$ or $>>$ button** to display a preview of the main letter with the actual address data before printing.
*   Once satisfied, click on the **“Next: Complete the Merge”** option to finish the merging process.
*   To send the merged data directly to a printer, click **Finish & Merge** sub-task under the Mailings tab, and then click **Print Documents**.

## 7. Creating Mailing Labels and Envelopes

The Mail Merge process is also used specifically for creating mailing labels and envelopes.

### Creating Mailing Labels

1.  **Create the Main Document:** Select **Mailings $\rightarrow$ Start Mail Merge $\rightarrow$ Labels**. The **Label Options dialog box** appears.
2.  **Select Label Type:** In the dialog box, select the type of printer and labels you want to use, or click **New Label** to create a custom label.
3.  **Open Data Source:** Select **Mailings $\rightarrow$ Select Recipients** and choose **Use Existing List** (or create a new one). Locate and open your data source.
4.  **Insert Merge Fields:** Select **Mailings $\rightarrow$ Write & Insert Fields** sub-task, click **Insert Merge Field**, and select the field names to be inserted onto the label document.
5.  **Preview and Merge:** Click **Preview Results** to view the merged labels with actual data. You can move through the data fields using the $<$ and $>$ buttons. Finally, click **Finish & Merge $\rightarrow$ Print Documents** to print.

### Creating Envelopes

This allows you to print addresses directly onto envelopes.

1.  **Create the Main Document:** Select **Mailings $\rightarrow$ Start Mail Merge $\rightarrow$ Envelopes**. The **Envelope Options dialog box** appears.
2.  **Select Envelope Options:** On the **Envelope Options tab**, select the desired **Envelope size** or **Custom size**. Adjust the address format and position. On the **Printing Options tab**, ensure the envelope feed options are correct for your printer, and then click **OK**.
3.  **Open Data Source:** Similar to labels, select the data source using **Mailings $\rightarrow$ Select Recipients $\rightarrow$ Use Existing List** (or create new).
4.  **Insert Merge Fields:** In the **Mailings Tab $\rightarrow$ Write & Insert Fields** sub-task, click **Insert Merge Field** and select the fields you want to appear on the envelope.
5.  **Preview and Merge:** Click **Preview Results** to view the merged envelopes with data. Click **Finish & Merge $\rightarrow$ Print Documents** to send the documents directly to a printer.