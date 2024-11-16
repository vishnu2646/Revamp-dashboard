
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
    ReportFIle: String;
    ReportTitle: String;
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
