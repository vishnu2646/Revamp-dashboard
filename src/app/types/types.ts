export interface IUser {
    UsrId: number,
    UsrName: String
}

export interface IUserInfo {
    Table: IUser[];
}

export interface IUserSession {
    AppUrl: String;
    AuthCode: String;
    ComCode: number;
    ComId: String;
    ComName: String;
    FailureCount: number;
    LiveStatus: String;
    UserEmail: String;
    UserMobNum: String;
    UsrId: number;
    UsrName: String;
    UsrPermission: String;
    logid: number;
    sessionId: String;
    status: String;
}

export interface IIpAdress {
    ip: string;
}

export interface IGroupData {
    [key: string]: Array<{[key: string]: any}>;
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

export interface IAdvanceReport {
    ActionResult: String;
    AddlSrcHtmlFile: String;
    DataSheetStart: number;
    ErrorDesc: String;
    ExcelOutput: String;
    HTMlString: 'N/A';
    ReportTitle: String;
    RevPDFPath: String;
    RevXlPath: String;
    RptId: number;
    RptOutputFile: String;
    SrcHTMLFile: String;
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

export interface IDashboardDropDown {
    SetId: number;
    SetName: String;
}

export interface IDashboardModal {
    APiUrl: String;
    GraphType: String;
    ModelName: String;
    Modelid: number;
    SetId: number;
    SetName: String;
    SubTitle: String;
    Title: String;
}
