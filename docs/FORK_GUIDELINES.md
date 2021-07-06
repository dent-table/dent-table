# Guidelines to edit a `dent-table` fork
This document contains detailed information on how to change some part of the shared codebase to meet customer-specific requirements.

Each paragraph refers to a comment form the codebase that starts with
```
TODO(fork):
```
and ends with
```
(SEE GUIDELINES)
```

In this document you'll then find a paragraph named like the comment message with detailed information about how to make changes to that piece of code.

For example, if in the codebase you find a comment 
```
// TODO(fork): update blah blah blah (SEE GUIDELINES)
```
then, you have to search in this document for a paragraph named `update blah blah blah`.

NOTE: remember that not all comments starts with `//`.
For example, html comments are of form `<!-- COMMENT -->`.
--------------------------------------------------------

### create home layout according customer requirements
You have to manually build the layout of the home page, putting each table to your preferred position. 

So, you have to add  a `TableWidgetComponent` for each table. 
You can place the tables into row and columns using [flex layout](https://github.com/angular/flex-layout#readme). 

**For each table defined into `TableDefinitions`**, add to the layout a line like this:
```html
<app-table-widget tableId="TABLE-ID" class="TABLE-STYLE-CLASS" draggable="false" fxFlex="1 1 PERCENTAGE" showButtons="true"
                  [orderColumn]="orderColumns['TABLE-ID']" (cellClick)="cellClicked(TABLE-ID, $event)"></app-table-widget>
```
where:
  - `TABLE-ID` is the table id number (get from `TableDefinition.tableId`) of the table the component refers to
  - `TABLE-STYLE-CLASS` is a [table style class](#table-style-classes)
  - `PERCENTAGE` is the width/height percentage that the table will occupy in a flex row/column.

NOTE: **carefully substitute the `TABLE-ID` value**. `TableWidgetCompnent` uses this value to layout the table, fetch data and handle user inputs.
**A wrong value could mess up the entire table!**

#### Table style classes
Table style classes define the color of the table. You can choose between these 10 classes:

``` jquery-css
table-widget-red
table-widget-pink
table-widget-deep-purple
table-widget-blue
table-widget-cyan
table-widget-teal
table-widget-green
table-widget-amber
table-widget-deep-orange
table-widget-brow
```


### change table ids into "src/assets/preferences.json"
Some preference values stored by `PreferenceService` are specified for each single table.

So, for that preferences you have to edit `src/assets/preferences.json` file according to the ids of your tables. 
