export interface IUser {
    UsrId: number,
    UsrName: String
}

export interface IUserInfo {
    Table: IUser[];
}

export interface IMenu {
    MdlType: String;
    Slno: number;
}

export interface IHistory {
    Action: String,
    ActionTime: String,
    LogId: number,
    Status: String,
    SystemName: String,
    Username: String,
    Value: number,
}

export interface IComments {
    By: String;
    CommentId: number;
    CommentText: String;
    Date: String;
    PrimeId: String;
    Subject: String;
}

export interface IAttachments {
    FilePath: String;
    Filecount: String;
    Mdlid: String;
    PrimeId: String;
    DisplayFileName: String;
    RefFilePath: String;
}

export interface IReport {
    Icon: String;
    ReportFIle: String;
    ReportTitle: String;
    ExcelOutput: String;
}

export interface IReportDetails {
    GetHtmlReportString: String;
}

export interface IActivity {
    Module: String;
    Username: String;
    actiontime: String;
    actionType: String;
    mdlid: String;
    primeid: String;
    activitydesc: String;
    fileurl: String;
}

export interface IRecentActivity {
    GetRecentActivity: {
        Table: IActivity[];
    }
}

export interface IReport {
    Rptid: number;
    ProceName: String;
    Reportname: String;
    RptGroup: String;
}

export interface IReportGroup {
    RptGroup: String;
}

export interface IAdvRmpRptGenData {
    AdvRmpRptGenData: {
        Table: IReport[];
        Table1: IReportGroup[]
    }
}


export interface ITilesData {
    DSBTitle: String;
    DSbId: number;
    DSbTypeSize: String;
    DisplayValue: number;
    Priority: number;
    RcdCount: number
}

export interface IChartData {
    DSBTitle: String;
    DsbId: number;
    Xlabel: String;
    Yvalues: number;
}

export interface IDashboardTable {
    DSBTitle: String;
    Invdate: String;
    Invno: String;
    Nettotal: number;
    Party: String;
    Refno: String;
    Roundoff: number;
    Subtotal: number;
    Taxtotal: number;
}

export interface IDashboardType {
    DSBStoredProName: String;
    DSBTitle: String;
    DSBTitleDisplayName: String;
    DSBid: number;
    DisplayvalueCol: String;
    ExpandData: String;
    GraphSize: String;
    RcdCnountCol: String;
    labelSize: String;
    labelTitle: String
}
