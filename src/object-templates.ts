export const OBJECT_TEMPLATES = {
    table: (id: number, name: string, namespace: string) => `namespace ${namespace};

    table ${id} "${name}"
    {
        DataClassification = CustomerContent;
        Caption = '${name}';
    
        fields
        {
            field(1; "No."; Code[20])
            {
                Caption = 'No.';
                DataClassification = CustomerContent;
            }
        }
    
        keys
        {
            key(PK; "No.")
            {
                Clustered = true;
            }
        }
    }`,

    tableextension: (
        id: number,
        name: string,
        namespace: string,
        extendsTable = ""
    ) => `namespace ${namespace};
    
    tableextension ${id} "${name}"${extendsTable ? ` extends "${extendsTable}"` : ""
        }
    {
        fields
        {
            // Add changes to table fields here
        }
    
        keys
        {
            // Add changes to keys here
        }
    
        fieldgroups
        {
            // Add changes to field groups here
        }
    }`,

    page: (id: number, name: string, namespace: string) => `namespace ${namespace};
    
    page ${id} "${name}"
    {
        PageType = Card;
        SourceTable = "";
        ApplicationArea = All;
        UsageCategory = None;
    
        layout
        {
            area(Content)
            {
                group(General)
                {
                    Caption = 'General';
                }
            }
        }
    
        actions
        {
            area(Processing)
            {
                action(ActionName)
                {
                    ApplicationArea = All;
                    Caption = 'Action Name';
                    
                    trigger OnAction()
                    begin
                        // Action logic here
                    end;
                }
            }
        }
    }`,

    pageextension: (
        id: number,
        name: string,
        namespace: string,
        extendsPage = ""
    ) => `namespace ${namespace};
    
    pageextension ${id} "${name}"${extendsPage ? ` extends "${extendsPage}"` : ""}
    {
        layout
        {
            // Add changes to page layout here
        }
    
        actions
        {
            // Add changes to page actions here
        }
    }`,

    codeunit: (id: number, name: string, namespace: string) => `namespace ${namespace};
    
    codeunit ${id} "${name}"
    {
        procedure ProcedureName()
        begin
            // Procedure logic here
        end;
    }`,

    report: (id: number, name: string, namespace: string) => `namespace ${namespace};
    
    report ${id} "${name}"
    {
        UsageCategory = ReportsAndAnalysis;
        ApplicationArea = All;
        DefaultLayout = RDLC;
        RDLCLayout = '${name}-Layout.rdlc';
    
        dataset
        {
            dataitem(DataItemName; "Table Name")
            {
                column(ColumnName; FieldName)
                {
                }
            }
        }
    
        requestpage
        {
            layout
            {
                area(Content)
                {
                    group(Options)
                    {
                        Caption = 'Options';
                    }
                }
            }
        }
    }`,

    reportextension: (
        id: number,
        name: string,
        namespace: string,
        extendsReport = ""
    ) => `namespace ${namespace};
    
    reportextension ${id} "${name}"${extendsReport ? ` extends "${extendsReport}"` : ""
        }
    {
        dataset
        {
            // Add changes to dataitems and columns here
        }
    
        requestpage
        {
            layout
            {
                // Add changes to request page layout here
            }
        }
    }`,

    permissionset: (id: number, name: string, namespace: string) => `namespace ${namespace};

    permissionset ${id} "${name}"
    {
        Assignable = true;
        Caption = '${name}';
        
        Permissions = 
            tabledata "Table Name" = RIMD;
    }`,

    enum: (id: number, name: string, namespace: string) => `namespace ${namespace};
    
    enum ${id} "${name}"
    {
        Extensible = true;
        Caption = '${name}';
    
        value(0; None)
        {
            Caption = 'None';
        }
    }`,

    enumextension: (
        id: number,
        name: string,
        namespace: string,
        extendsEnum = ""
    ) => `namespace ${namespace};
    
    enumextension ${id} "${name}"${extendsEnum ? ` extends "${extendsEnum}"` : ""}
    {
        value(0; NewValue)
        {
            Caption = 'New Value';
        }
    }`,
    query: (id: number, name: string, namespace: string) => `namespace ${namespace};
    
    query ${id} "${name}"
    {
        QueryType = Normal;
        Caption = '${name}';
        elements
        {
    
          dataitem(DataItemName; "Table Name")
          {
            column(ColumnName; FieldName)
            {
            }
          }
        }
    }`,
} as const