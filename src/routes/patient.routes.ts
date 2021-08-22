import {Request, Response, Router} from 'express'
import {di} from '../di'
import * as _ from 'lodash'
import CryptoJS from "crypto-js";
import moment from 'moment-timezone';
moment.tz.setDefault('Asia/Bangkok');
import axios from 'axios'
import {neo4jSetting} from "../config/config";

class ctRoute {
    Capitalize = (s : any) => {
        if (typeof s !== 'string') 
            return ''


        


        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    async postPatientByHN(data : any) {

        await this.postPatientInfoBYHN(data)
        await this.postEmergencyByHN(data)
        await this.postParentByHN(data)
        await this.postPatientAddressByHN(data)
        await this.postPatientFamilyByHN(data)
        await this.postPatientSocialByHN(data)
        await this.updateScreeningDataGroupBYNationID(data)


    }

    async postPatientInfoBYHN(HN : any) {
        let repos = di.get("cache")
        let result: any = await new Promise((resolve, reject) => {
            repos.reserve((err : any, connObj : any) => {
                if (connObj) {
                    let conn = connObj.conn;
                    conn.createStatement((err : any, statement : any) => {
                        if (err) {
                            reject(err);
                        } else {
                            statement.setFetchSize(100, function (err : any) {
                                if (err) {
                                    reject(err);
                                } else {
                                    const query = `SELECT	PAPMI_No "HN",
                  PAPMI_Title_DR->TTL_RowId "Title",
                  PAPMI_Name "Firstname",
                  PAPMI_Name2 "Lastname",
                  PAPMI_Name5 "FirstnameEn",
                  PAPMI_Name7 "LastnameEn",
                  tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
                  PAPMI_Sex_DR "Gender",
                  PAPER_Nation_DR "Nationality",
                  PAPER_Religion_DR "Religion",
                PAPER_PrefLanguage_DR "PreferredLanguage",
                  PAPMI_Email "Email",
                  PAPER_ID "NationalID",
                  PAPER_PassportNumber "Passport",
                  SUBSTRING(PAPER_Marital_DR->CTMAR_Desc, CHARINDEX('(', PAPER_Marital_DR->CTMAR_Desc)+1, (LENGTH(PAPER_Marital_DR->CTMAR_Desc)-CHARINDEX('(', PAPER_Marital_DR->CTMAR_Desc))-1) "MaritalStatus",
                  PAPER_SocialStatus_DR->SS_Desc "Occupation",
                  PAPER_MobPhone "PhoneNo",
                  PAPER_TelH "Homephone" ,
            CASE
                  WHEN PAPMI_Title_DR->TTL_Code LIKE '%e%' THEN 'en'
                  ELSE 'th'
            END "DefaultLanguage",
            CASE
                WHEN PAPER_AgeYr > 15 THEN 0
                 ELSE 1
            END "type",
            0 "Confirm",
            0 "Approve"
              FROM PA_PatMas
              LEFT JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
              WHERE PAPMI_No IS NOT NULL AND PAPMI_No = '${HN}' `;
                                    statement.executeQuery(query, function (err : any, resultset : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resultset.toObjArray(function (err : any, results : any) {
                                                resolve(results);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    repos.release(connObj, function (err : any) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
        repos = di.get("repos")
        let query_1 = `REPLACE INTO Screening.Patient_Info SET ? `

        await result.map((d : any) => {
            repos.query(query_1, d, function (err : any, results : any) {
                if (err) {
                    return console.error(err.message);
                }
            });
        })
        return result[0].HN

    }
    async updateScreeningDataGroupBYNationID(HN : any) {
        let repos = di.get("repos")
        let identifier: any = null
        let query = `SELECT HN FROM Screening.Patient_Financial WHERE HN = '${HN}' `
        repos.query(query, function (err : any, results : any) {
            if (err) {
                return console.error(err.message);
            }
            if (results.length == 0) {
                query = `SELECT NationalID, Passport FROM Screening.Patient_Info WHERE HN = '${HN}' `
                repos.query(query, function (err2 : any, results2 : any) {
                    if (err2) {
                        return console.error(err2.message);
                    }
                    if (results2.length > 0) {

                        identifier = results2.NationalID != null ? 'NationalID' : 'Passport'
                        query = `REPLACE INTO Screening.Patient_Financial (HN) VALUES ('${HN}') `
                        repos.query(query, function (err : any, results : any) {
                            if (err) {
                                return console.error(err.message);
                            }
                            query = `UPDATE Screening.Patient_Financial pf1 
                            INNER JOIN Screening.Patient_Info pi1 ON pf1.HN = pi1.HN
                            INNER JOIN Registration.Patient_Info pi2 ON pi1.${identifier} = pi2.${identifier} 
                            INNER JOIN Registration.Patient_Financial pf2 ON pf2.PatientID = pi2.ID 
                            SET pf1.SelfPay = pf2.SelfPay,
                                pf1.CompanyContact = pf2.CompanyContact,
                                pf1.Insurance = pf2.Insurance,
                                pf1.CompanyDesc = pf2.CompanyDesc,
                                pf1.InsuranceDesc = pf2.InsuranceDesc,
                                pf1.PaymentAs = pf2.PaymentAs,
                                pf1.Title = pf2.Title,
                                pf1.Firstname = pf2.Firstname,
                                pf1.Lastname = pf2.Lastname,
                                pf1.DOB = pf2.DOB,
                                pf1.Aforemention = pf2.Aforemention
                            WHERE  pi1.HN = '${HN}' `
                            repos.query(query)
                        });

                    }
                });
            }
        });

        query = `SELECT HN FROM Screening.Patient_History WHERE HN = '${HN}' `
        repos.query(query, function (err : any, results : any) {
            if (err) {
                return console.error(err.message);
            }
            if (results.length == 0) {
                query = `SELECT NationalID, Passport FROM Screening.Patient_Info WHERE HN = '${HN}' `
                repos.query(query, function (err2 : any, results2 : any) {
                    if (err2) {
                        return console.error(err2.message);
                    }
                    if (results2.length > 0) {
                        identifier = results2.NationalID != null ? 'NationalID' : 'Passport'
                        query = `REPLACE INTO Screening.Patient_History (HN) VALUES ('${HN}') `
                        repos.query(query, function (err : any, results : any) {
                            if (err) {
                                return console.error(err.message);
                            }
                            query = `UPDATE Screening.Patient_History ph1 
                  INNER JOIN Screening.Patient_Info pi1 ON ph1.HN = pi1.HN
                  INNER JOIN Registration.Patient_Info pi2 ON pi1.${identifier} = pi2.${identifier} 
                  INNER JOIN Registration.Patient_History ph2 ON ph2.PatientID = pi2.ID 
                  SET ph1.MaritalStatus = ph2.MaritalStatus,
                      ph1.Children = ph2.Children,
                      ph1.Diseases = ph2.Diseases,
                      ph1.Medication = ph2.Medication,
                      ph1.CommentMedication = ph2.CommentMedication,
                      ph1.Hospitalization = ph2.Hospitalization,
                      ph1.CommentHospitalization = ph2.CommentHospitalization,
                      ph1.Physical = ph2.Physical,
                      ph1.CommentPhysical = ph2.CommentPhysical,
                      ph1.Exercise = ph2.Exercise,
                      ph1.Pregnant = ph2.Pregnant,
                      ph1.CommentPregnant = ph2.CommentPregnant,
                      ph1.Giver = ph2.Giver,
                      ph1.CommentGiver = ph2.CommentGiver,
                      ph1.AbsenceFromWork = ph2.AbsenceFromWork,
                      ph1.Reimbursement = ph2.Reimbursement,
                      ph1.GovernmentReimbursement = ph2.GovernmentReimbursement,
                      ph1.StateEnterprise = ph2.StateEnterprise,
                      ph1.Authorize = ph2.Authorize,
                      ph1.CommentAuthorize = ph2.CommentAuthorize,
                      ph1.Spiritual = ph2.Spiritual,
                      ph1.CommentSpiritual = ph2.CommentSpiritual,
                      ph1.Allergies = ph2.Allergies,
                      ph1.CommentAllergies = ph2.CommentAllergies,
                      ph1.Alcohol = ph2.Alcohol,
                      ph1.DrugAbuse = ph2.DrugAbuse,
                      ph1.Smoke = ph2.Smoke,
                      ph1.FatherAlive = ph2.FatherAlive,
                      ph1.FatherAge = ph2.FatherAge,
                      ph1.CauseFather = ph2.CauseFather,
                      ph1.MotherAlive = ph2.MotherAlive,
                      ph1.MotherAge = ph2.MotherAge,
                      ph1.CauseMother = ph2.CauseMother 
                  WHERE pi1.HN = '${HN}'  `
                            repos.query(query)
                        });

                    }
                });
            }
        });


    }

    async postEmergencyByHN(HN : any) {
        let repos = di.get("cache");
        let result: any = await new Promise((resolve, reject) => {
            repos.reserve((err : any, connObj : any) => {
                if (connObj) {
                    let conn = connObj.conn;

                    conn.createStatement((err : any, statement : any) => {
                        if (err) {
                            reject(err);
                        } else {
                            statement.setFetchSize(100, function (err : any) {
                                if (err) {
                                    reject(err);
                                } else {
                                    const query = `SELECT	NOK_PAPMI_ParRef->PAPMI_No "HN",
                              CASE 
                                WHEN NOK.NOK_PAPER_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_Name
                                ELSE NOK.NOK_Name 
                              END "Firstname", 
                                        CASE 
                                          WHEN NOK.NOK_PAPER_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_Name2
                                          ELSE NOK.NOK_Name2
                                        END "Lastname",
                                        NOK.NOK_Relation_DR "Relation",
                                        CASE 
                                          WHEN NOK.NOK_PAPER_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_Email
                                          ELSE NOK.NOK_Email
                                        END "Email",
                                        CASE
                                          WHEN NOK.NOK_PAPER_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_TelH
                                            WHEN NOK.NOK_MobPhone IS NOT NULL THEN NOK_MobPhone
                                            ELSE NOK.NOK_TelH
                                        END "PhoneNo",
                                        CASE 
                                          WHEN NOK.NOK_PAPER_DR->PAPER_Country_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_Country_DR
                                             WHEN Nok.NOK_Country_DR->CTCOU_RowId IS NULL 
                                               AND ((Nok.NOK_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                                              OR (NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId NOT IN ('77', '78') AND NOK_Zip_DR->CTZIP_Province_DR->PROV_RowId IS NOT NULL)
                                               OR (NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId NOT IN ('1116', '936') AND NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IS NOT NULL)) THEN 2
                                             ELSE NOK_Country_DR->CTCOU_RowId
                                          END "Country",
                                        CASE 
                                WHEN NOK.NOK_PAPER_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_Zip_DR->CTZIP_Code
                                ELSE NOK.NOK_Zip_DR->CTZIP_Code
                              END "Postcode",
                                        CASE 
                                WHEN NOK.NOK_PAPER_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_CityArea_DR
                                ELSE NOK.NOK_CityArea_DR
                              END "Subdistrict",
                                        CASE 
                                WHEN NOK.NOK_PAPER_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_CityCode_DR
                                ELSE NOK.NOK_CityCode_DR
                              END "District",
                                        CASE 
                                WHEN NOK.NOK_PAPER_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_NokAddress1
                                ELSE NOK.NOK_StNameLine1
                              END "Address",
                                        CASE 
                                WHEN NOK.NOK_PAPER_DR IS NOT NULL THEN NOK.NOK_PAPER_DR->PAPER_CT_Province_DR
                                ELSE NOK.NOK_Province_DR
                              END "Province",
                                        '0' "sameAddress" FROM PA_Nok Nok
                                        Where NOK_PAPMI_ParRef->PAPMI_No = '${HN}'
                                        AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_AgeYr > 15
                                        AND ((NOK.NOK_Name IS NOT NULL AND NOK.NOK_Name2 IS NOT NULL) OR 
                                        (NOK.NOK_PAPER_DR->PAPER_Name IS NOT NULL AND NOK.NOK_PAPER_DR->PAPER_Name2 IS NOT NULL))
                                        ORDER BY NOK_PAPMI_ParRef Desc  `;
                                    statement.executeQuery(query, function (err : any, resultset : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resultset.toObjArray(function (err : any, results : any) {
                                                resolve(results);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    repos.release(connObj, function (err : any) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
        repos = di.get("repos")
        let query_1 = `REPLACE INTO Screening.Patient_Emergency SET ? `
        await result.map(async (d : any) => {
            repos.query(query_1, d, function (err : any, results : any) {
                if (err) {
                    return console.error(err.message);
                } else {
                    let query_2 = `UPDATE Screening.Patient_Emergency pe
          SET pe.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
          (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pe.Subdistrict limit 1) AND ca1.Zip_Code = pe.Postcode limit 1)
          WHERE pe.HN = '${HN}'`
                    repos.query(query_2, function (err2 : any, results2 : any) {
                        if (err2) {
                            return console.error(err2.message);
                        }
                    });
                }
            });


        });


    }
    async postParentByHN(HN : any) {
        let repos = di.get("cache");
        let result: any = await new Promise((resolve, reject) => {
            repos.reserve((err : any, connObj : any) => {
                if (connObj) {
                    let conn = connObj.conn;

                    conn.createStatement((err : any, statement : any) => {
                        if (err) {
                            reject(err);
                        } else {
                            statement.setFetchSize(100, function (err : any) {
                                if (err) {
                                    reject(err);
                                } else {
                                    const query = `SELECT	NOK_PAPMI_ParRef->PAPMI_No "HN",
                    NOK.NOK_Name "Firstname", 
                    NOK.NOK_Name2 "Lastname",
                    NOK.NOK_Relation_DR "Relation",
                    NOK.NOK_Email "Email",
                    CASE
                        WHEN NOK.NOK_MobPhone IS NOT NULL THEN Nok_TelH
                        ELSE NOK.NOK_TelH
                    END "PhoneNo",
                    CASE 
                         WHEN Nok.NOK_Country_DR->CTCOU_RowId IS NULL 
                           AND ((Nok.NOK_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                          OR (NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId NOT IN ('77', '78') AND NOK_Zip_DR->CTZIP_Province_DR->PROV_RowId IS NOT NULL)
                           OR (NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId NOT IN ('1116', '936') AND NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IS NOT NULL)) THEN 2
                         ELSE NOK_Country_DR->CTCOU_RowId
                      END "Country",
                    NOK.NOK_Zip_DR->CTZIP_Code "Postcode",
                    NOK.NOK_CityArea_DR "Subdistrict",
                    NOK.NOK_CityCode_DR "District",
                    NOK.NOK_StNameLine1 "Address",
                    NOK.NOK_Province_DR "Province",
                    '0' "sameAddress"FROM PA_Nok Nok
                    Where NOK_PAPMI_ParRef->PAPMI_No = '${HN}' 
                    AND Nok.NOK_Name is not null AND Nok.NOK_Name2 is not null 
                    AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_AgeYr <= 15
                    ORDER BY NOK_PAPMI_ParRef Desc `;
                                    statement.executeQuery(query, function (err : any, resultset : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resultset.toObjArray(function (err : any, results : any) {
                                                resolve(results);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    repos.release(connObj, function (err : any) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
        repos = di.get("repos")
        let query_1 = `REPLACE INTO Screening.Parent SET ? `
        result.map(async (d : any) => {
            await repos.query(query_1, d, function (err : any, results : any) {
                if (err) {
                    return console.error(err.message);
                }
            });
            let query_2 = `UPDATE Screening.Parent pr
        SET pr.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
        (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pr.Subdistrict limit 1) AND ca1.Zip_Code = pr.Postcode limit 1)
        WHERE pr.HN = '${HN}' `
            repos.query(query_2, function (err : any, results : any) {
                if (err) {
                    return console.error(err.message);
                }
            });
        })

    }
    async postPatientAddressByHN(HN : any) {
        let repos = di.get("cache");
        let result: any = await new Promise((resolve, reject) => {
            repos.reserve((err : any, connObj : any) => {
                if (connObj) {
                    let conn = connObj.conn;

                    conn.createStatement((err : any, statement : any) => {
                        if (err) {
                            reject(err);
                        } else {
                            statement.setFetchSize(100, function (err : any) {
                                if (err) {
                                    reject(err);
                                } else {
                                    const query = `SELECT PAPMI_No "HN",
                    CASE 
                       WHEN PAPER_Country_DR IS NULL 
                       AND ((PAPER_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                       OR (PAPER_Zip_DR->CTZIP_Province_DR NOT IN ('77', '78') AND PAPER_Zip_DR->CTZIP_Province_DR IS NOT NULL)
                       OR (PAPER_Zip_DR->CTZIP_CITY_DR NOT IN ('1116', '936') AND PAPER_Zip_DR->CTZIP_CITY_DR IS NOT NULL)) THEN 2
                       ELSE PAPER_Country_DR
                      END "Country",
                      CASE
                       WHEN PAPER_Zip_DR->CTZIP_Code IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') THEN null
                       ELSE  PAPER_Zip_DR->CTZIP_Code
                      END "Postcode",
                        CASE
                       WHEN PAPER_Zip_DR->CTZIP_Province_DR IN ('77', '78') THEN null
                       ELSE PAPER_Zip_DR->CTZIP_Province_DR
                      END "Province",
                      CASE
                       WHEN PAPER_Zip_DR->CTZIP_CITY_DR IN ('1116', '936') THEN null
                       ELSE  PAPER_Zip_DR->CTZIP_CITY_DR
                      END "District",
                      PAPER_CityArea_DR "Subdistrict",
                      PAPER_StName "Address",
                            '0' "Type"
                      FROM PA_PatMas
                        INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                        WHERE PAPMI_No = '${HN}'
                    `;
                                    statement.executeQuery(query, function (err : any, resultset : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resultset.toObjArray(function (err : any, results : any) {
                                                resolve(results);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    repos.release(connObj, function (err : any) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
        repos = di.get("repos")


        let query_del

        let query_1 = `INSERT INTO Screening.Patient_Address SET ? `
        result.map(async (d : any) => {
            query_del = `DELETE FROM Screening.Patient_Address WHERE HN = '${
                d.HN
            }' AND Type = '${
                d.Type
            }' `
            repos.query(query_del, function (err : any, results : any) {
                if (err) {
                    return console.error(err.message);
                }
                repos.query(query_1, d, function (err : any, results : any) {
                    if (err) {
                        return console.error(err.message);
                    }
                    let query_2 = `UPDATE Screening.Patient_Address pa
            SET pa.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
            (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pa.Subdistrict limit 1) AND ca1.Zip_Code = pa.Postcode limit 1)
            WHERE pa.HN = '${HN}' `
                    repos.query(query_2, function (err : any, results : any) {
                        if (err) {
                            return console.error(err.message);
                        }
                    });


                });
            });


        });
        let query = `SELECT * FROM Screening.Patient_Address WHERE HN = ${HN} AND Type = 1 `
        repos.query(query, function (err : any, results : any) {
            if (err) {
                return console.error(err.message);
            }
            if (results.length == 0) {
                query = `INSERT INTO Screening.Patient_Address (HN, Type) Values ('${HN}',1)  `
                repos.query(query, function (err2 : any, results2 : any) {
                    if (err2) {
                        return console.error(err2.message);
                    }
                });
            }
        });
    }
    async postPatientFamilyByHN(HN : any) {
        let repos = di.get("cache");
        let result: any = await new Promise((resolve, reject) => {
            repos.reserve((err : any, connObj : any) => {
                if (connObj) {
                    let conn = connObj.conn;

                    conn.createStatement((err : any, statement : any) => {
                        if (err) {
                            reject(err);
                        } else {
                            statement.setFetchSize(100, function (err : any) {
                                if (err) {
                                    reject(err);
                                } else {
                                    const query = `SELECT DISTINCT FAM_PAPMI_ParRef->PAPMI_No "HN", 
                  FAM_Relation_DR "Person",
                  FAM_Desc "Disease"
                  FROM PA_Family
                  WHERE FAM_PAPMI_ParRef->PAPMI_No = '${HN}' `;
                                    statement.executeQuery(query, function (err : any, resultset : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resultset.toObjArray(function (err : any, results : any) {
                                                resolve(results);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    repos.release(connObj, function (err : any) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
        repos = di.get("repos")
        let query_del = `DELETE FROM Screening.Family_History WHERE HN = '${HN}' `
        await repos.query(query_del);

        let query_1 = `INSERT INTO Screening.Family_History SET ? `


        result.map(async (d : any) => {

            repos.query(query_1, d, function (err : any, results : any) {
                if (err) {
                    return console.error(err.message);
                }
                let query_2 = `UPDATE Screening.Family_History fh
        SET Disease = (SELECT ID FROM Registration.CT_Diseases WHERE DescEN = fh.Disease OR DescTH = fh.Disease limit 1)
        WHERE fh.HN = '${HN}' AND  fh.Person = '${
                    d.Person
                }' AND Disease NOT IN (SELECT ID FROM Registration.CT_Diseases) `
                repos.query(query_2, function (err : any, results : any) {
                    if (err) {
                        return console.error(err.message);
                    }
                });
            });

        })

    }
    async postPatientSocialByHN(HN : any) {
        let repos = di.get("cache");
        let result: any = await new Promise((resolve, reject) => {
            repos.reserve((err : any, connObj : any) => {
                if (connObj) {
                    let conn = connObj.conn;

                    conn.createStatement((err : any, statement : any) => {
                        if (err) {
                            reject(err);
                        } else {
                            statement.setFetchSize(100, function (err : any) {
                                if (err) {
                                    reject(err);
                                } else {
                                    const query = `SELECT TOP 1 SCH_PAPMI_ParRef->PAPMI_No "HN", 
                                    LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) "Habit",
                                    CASE WHEN SCH_HabitsQty_DR->QTY_desc = 'None' THEN NULL
                                      ELSE SCH_HabitsQty_DR->QTY_desc
                                    END"Quantity", 
                                    SCH_Desc "Comment",
                                    CASE WHEN SCH_HabitsQty_DR->QTY_desc IS NOT NULL AND SCH_HabitsQty_DR->QTY_desc = 'None' THEN 0
                                      ELSE 1
                                    END "Status"
                                    FROM PA_SocHist 
                                    WHERE SCH_PAPMI_ParRef->PAPMI_No = '${HN}' 
                                    AND LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) = 'alcohol'
                                    ORDER BY SCH_UpdateDate DESC, SCH_UpdateTime DESC
                                    UNION SELECT TOP 1 SCH_PAPMI_ParRef->PAPMI_No "HN", 
                                    LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) "Habit",
                                    CASE WHEN SCH_HabitsQty_DR->QTY_desc = 'None' THEN NULL
                                      ELSE SCH_HabitsQty_DR->QTY_desc
                                    END"Quantity", 
                                    SCH_Desc "Comment",
                                    CASE WHEN SCH_HabitsQty_DR->QTY_desc IS NOT NULL AND SCH_HabitsQty_DR->QTY_desc = 'None' THEN 0
                                      ELSE 1
                                    END "Status"
                                    FROM PA_SocHist 
                                    WHERE SCH_PAPMI_ParRef->PAPMI_No = '${HN}' 
                                    AND LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) = 'exercise'
                                    ORDER BY SCH_UpdateDate DESC, SCH_UpdateTime DESC
                                    UNION SELECT TOP 1 SCH_PAPMI_ParRef->PAPMI_No "HN", 
                                    LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) "Habit",
                                    CASE WHEN SCH_HabitsQty_DR->QTY_desc = 'None' THEN NULL
                                      ELSE SCH_HabitsQty_DR->QTY_desc
                                    END"Quantity", 
                                    SCH_Desc "Comment",
                                    CASE WHEN SCH_HabitsQty_DR->QTY_desc IS NOT NULL AND SCH_HabitsQty_DR->QTY_desc = 'None' THEN 0
                                      ELSE 1
                                    END "Status"
                                    FROM PA_SocHist 
                                    WHERE SCH_PAPMI_ParRef->PAPMI_No = '${HN}' 
                                    AND LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) = 'smoking'
                                    ORDER BY SCH_UpdateDate DESC, SCH_UpdateTime DESC
                                    UNION SELECT TOP 1 SCH_PAPMI_ParRef->PAPMI_No "HN", 
                                    LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) "Habit",
                                    CASE WHEN SCH_HabitsQty_DR->QTY_desc = 'None' THEN NULL
                                      ELSE SCH_HabitsQty_DR->QTY_desc
                                    END"Quantity", 
                                    SCH_Desc "Comment",
                                    CASE WHEN SCH_HabitsQty_DR->QTY_desc IS NOT NULL AND SCH_HabitsQty_DR->QTY_desc = 'None' THEN 0
                                      ELSE 1
                                    END "Status"
                                    FROM PA_SocHist 
                                    WHERE SCH_PAPMI_ParRef->PAPMI_No = '${HN}' 
                                    AND LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) = 'drugabuse'
                                    ORDER BY SCH_UpdateDate DESC, SCH_UpdateTime DESC `;

                                    statement.executeQuery(query, function (err : any, resultset : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resultset.toObjArray(function (err : any, results : any) {
                                                resolve(results);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    repos.release(connObj, function (err : any) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
        let query_del = `DELETE FROM Screening.Patient_Social WHERE HN = '${HN}' `
        repos = di.get("repos")
        await repos.query(query_del)

        let query_1 = `INSERT INTO Screening.Patient_Social SET ? `
        result.map(async (d : any) => {
            repos.query(query_1, d, function (err : any, results : any) {
                if (err) {
                    return console.error(err.message);
                }
            });
        })


    }

    getPatientInfo() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = `select HN from TrueEye.Patient_Info pi2 where Patient_RowID is null`
            let listHN = await repos.query(query)

            repos = di.get('cache')
            console.log(listHN.length)
            listHN.map(async (d : any) => {
                let result: any = await new Promise((resolve, reject) => {
                    repos.reserve((err : any, connObj : any) => {
                        if (connObj) {
                            let conn = connObj.conn;
                            conn.createStatement((err : any, statement : any) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    statement.setFetchSize(100, function (err : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            const query = `SELECT PAPMI_RowID1 "Patient_RowID", '${
                                                d.HN
                                            }' "HN", PAPER_AgeYr "Age", PAPER_Dob "DateOfBirth", PAPER_Sex_DR->CTSEX_Desc "Sex", 
                                        PAPER_Nation_DR->CTNAT_Desc "Nationality" 
                  FROM PA_PatMas
                  LEFT JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                  WHERE PAPMI_No IS NOT NULL AND PAPMI_No = '${
                                                d.HN
                                            }' `;

                                            statement.executeQuery(query, function (err : any, resultset : any) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resultset.toObjArray(function (err : any, results : any) {
                                                        resolve(results);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            repos.release(connObj, function (err : any) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                });
                repos = di.get('repos')
                result.map(async (d : any) => {

                    query = `REPLACE INTO TrueEye.Patient_Info SET ?`
                    await repos.query(query, d)
                })
            })


        }
    }

    getPatientSocial() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let {numb} = req.query
            let query = `select Patient_RowID from TrueEye.Patient_Info pi2 Where Patient_RowID is not null LIMIT ${numb}, 100`
            let listRowID = await repos.query(query)

            repos = di.get('cache')
            console.log(listRowID.length)
            listRowID.map(async (d : any) => {
                let result: any = await new Promise((resolve, reject) => {
                    repos.reserve((err : any, connObj : any) => {
                        if (connObj) {
                            let conn = connObj.conn;
                            conn.createStatement((err : any, statement : any) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    statement.setFetchSize(100, function (err : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            const query = `SELECT SCH_RowId, 
                                        SCH_PAPMI_ParRef "Patient_RowID", 
                                        LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) "SCH_Habits",
                                        CASE WHEN SCH_HabitsQty_DR->QTY_desc = 'None' THEN 'No'
                                          ELSE 'Yes' 
                                        END "Status", 
                                        SCH_UpdateDate, 
                                        SCH_UpdateTime
                                        FROM PA_SocHist 
                                        WHERE SCH_PAPMI_ParRef = ${
                                                d.Patient_RowID
                                            } 
                                        AND (LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) = 'alcohol' 
                                        OR LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) = 'smoking')`;

                                            statement.executeQuery(query, function (err : any, resultset : any) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resultset.toObjArray(function (err : any, results : any) {
                                                        resolve(results);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            repos.release(connObj, function (err : any) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                });
                repos = di.get('repos')
                await result.map(async (d : any) => {
                    query = `REPLACE INTO TrueEye.Patient_Social SET ?`
                    await repos.query(query, d)
                })
            })
            console.log('finish')


        }
    }

    getPatientADM() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let {numb} = req.query
            let query = `select Patient_RowID from TrueEye.Patient_Info pi2 Where Patient_RowID is not null limit ${numb}, 100`
            let listRowID = await repos.query(query)
            repos = di.get('cache')
            let admdata: any = []
            let result: any = []


            const data = listRowID.map(async (d : any) => {
                result = await new Promise((resolve, reject) => {
                    repos.reserve((err : any, connObj : any) => {
                        if (connObj) {
                            let conn = connObj.conn;
                            conn.createStatement((err : any, statement : any) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    statement.setFetchSize(100, function (err : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            const query = `SELECT PAADM_RowID "ADM_RowId", PAADM_ADMNo "ADM_No", PAADM_PAPMI_DR "Patient_RowId",	
                                            PAADM_AdmDate "ADM_Date", PAADM_AdmTime "ADM_Time"
                                            FROM PA_Adm 
                                            WHERE PAADM_PAPMI_DR = ${
                                                d.Patient_RowID
                                            } `;

                                            statement.executeQuery(query, function (err : any, resultset : any) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resultset.toObjArray(function (err : any, results : any) {
                                                        resolve(results)
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            repos.release(connObj, function (err : any) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                })

                return result
            });


            // await Promise.all(result)
            // console.log(result.length)
            // await result.map(async(d:any) => {
            //     admdata.push( {
            //         ADM_RowId : d.ADM_RowId,
            //         Patient_RowId : d.Patient_RowId,
            //         ADM_No : d.ADM_No,
            //         ADM_Date : d.ADM_Date,
            //         ADM_Time : d.ADM_Time
            //     })
            // })

            // console.log('finish')
            // res.send('test')


            // console.log(result.length)
            // console.log(result[0])
            // result.then(function(results :any){

            //     test = results; // Now you can use res everywhere
            //     console.log(test)
            // });
            res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=*Vital${numb}*.csv`
            });
            var allObjects = [];
            // Pushing the headers, as the first arr in the 2-dimensional array 'allObjects' would be the first row
            allObjects.push([
                "ADM_RowId",
                "Patient_RowId",
                "ADM_No",
                "ADM_Date",
                "ADM_Time"
            ]);

            console.log(data.length)
            let bb = await Promise.all(data)
            bb.map((d : any) => {
                d.map((a : any) => {
                    var arr = [];
                    arr.push(a.ADM_RowId);
                    arr.push(a.Patient_RowId);
                    arr.push(a.ADM_No);
                    arr.push(a.ADM_Date);
                    arr.push(a.ADM_Time);

                    allObjects.push(arr)
                })
            })

            await Promise.all(allObjects)
            console.log(allObjects.length)
            var csvContent = "";
            allObjects.forEach(function (infoArray : any, index : any) {
                var dataString = infoArray.join(",");
                csvContent += index < allObjects.length ? dataString + "\n" : dataString;
            });
            await Promise.all(csvContent)
            // Returning the CSV output
            // // await console.log(listRowID.length)
            // await console.log(numFruits.length)
            await res.end(csvContent, "binary");
            console.log('2222')
        }


    }

    getPatientLab() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = `select HN, ADM_No from TrueEye.Patient_Adm
            INNER JOIN TrueEye.Patient_Info ON TrueEye.Patient_Adm.Patient_RowId = TrueEye.Patient_Info.Patient_RowId
            WHERE ADM_No IS NOT NULL  LIMIT 100 `
            let listRowID = await repos.query(query)

            repos = di.get('cache')
            console.log(listRowID.length)
            listRowID.map(async (d : any) => {
                let result: any = await new Promise((resolve, reject) => {
                    repos.reserve((err : any, connObj : any) => {
                        if (connObj) {
                            let conn = connObj.conn;
                            conn.createStatement((err : any, statement : any) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    statement.setFetchSize(100, function (err : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            const query = `CALL Custom_THSV_Report_ZEN_StoredProc.SVNHRptEprLabResult_GetData('${
                                                d.HN
                                            }', '${
                                                d.ADM_No
                                            }')`;

                                            statement.executeQuery(query, function (err : any, resultset : any) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resultset.toObjArray(function (err : any, results : any) {
                                                        resolve(results);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            repos.release(connObj, function (err : any) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                });
                repos = di.get('repos')
                await result.map(async (d : any) => {
                    if (d.DateOfAuth != null) {
                        d.DateOfAuth = d.DateOfAuth.toString().substring(6, 10) + '-' + d.DateOfAuth.toString().substring(3, 5) + '-' + d.DateOfAuth.toString().substring(0, 2)
                    }

                    if (d.DateOfRec != null) {
                        d.DateOfRec = d.DateOfRec.toString().substring(6, 10) + '-' + d.DateOfRec.toString().substring(3, 5) + '-' + d.DateOfRec.toString().substring(0, 2)
                    }

                    d.LabProcessDate = d.DateOfAuth
                    d.LabReceiptDate = d.DateOfRec
                    delete d.DateOfAuth
                    delete d.DateOfRec
                    delete d.title
                    delete d.Fname
                    delete d.Lname
                    let query_del = `DELETE FROM  TrueEye.Patient_Lab WHERE EpisodeNo = '${
                        d.EpisodeNo
                    }' 
                AND tsCode = '${
                        d.tsCode
                    }' AND tcCode = '${
                        d.tcCode
                    }' `
                    await repos.query(query_del)
                    query = `INSERT INTO TrueEye.Patient_Lab SET ?`
                    await repos.query(query, d, function (err : any, res : any) {
                        if (err) 
                            throw err;
                        
                        console.log(err);
                    })
                })
            })
            console.log('finish')


        }
    }

    getPatientVitalSign() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let {numb} = req.query
            let query = `select HN, ADM_RowId from TrueEye.Patient_Adm
            INNER JOIN TrueEye.Patient_Info ON TrueEye.Patient_Adm.Patient_RowId = TrueEye.Patient_Info.Patient_RowId
             LIMIT ${numb}, 50000 `
            let listRowID = await repos.query(query)
            var allObjects:any = [];
            // Pushing the headers, as the first arr in the 2-dimensional array 'allObjects' would be the first row
            allObjects.push([
                "paadmid",
                "weight",
                "height",
                "BPDiastolic",
                "BPSystolic",
                "Pulses",
                "BPMeans",
                "paadmidNo"
            ]);
            repos = di.get('cache')
            console.log(listRowID.length)
            let b = await listRowID.map(async (d : any) => {
                let result: any = await new Promise((resolve, reject) => {
                    repos.reserve((err : any, connObj : any) => {
                        if (connObj) {
                            let conn = connObj.conn;
                            conn.createStatement((err : any, statement : any) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    statement.setFetchSize(100, function (err : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            const query = `CALL Custom_THSV_Report_ZEN_StoredProc.SVNHrptEprObservation_GetData(${
                                                d.ADM_RowId
                                            })`;

                                            statement.executeQuery(query, function (err : any, resultset : any) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resultset.toObjArray(function (err : any, results : any) {
                                                        resolve(results);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            repos.release(connObj, function (err : any) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                });
                await Promise.all(result)
                let data
                    repos = di.get('repos')
                    data = await result.map(async (d : any) => {
                        if (!_.isEmpty(d.StatusArrival) && !_.isEmpty(d.StatusArrival.trim()) &&
                    ((!_.isEmpty(d.weight) && !_.isEmpty(d.weight.trim())) || (!_.isEmpty(d.BPDiastolic) && !_.isEmpty(d.BPDiastolic.trim())))) {
                        var arr = [];
                    arr.push(d.paadmid)
                    arr.push(d.weight);
                    arr.push(d.height);
                    arr.push(d.BPDiastolic);
                    arr.push(d.BPSystolic);
                    arr.push(d.Pulses);
                    arr.push(d.BPMeans);
                    arr.push(d.paadmidNo);

                    allObjects.push(arr)
                    }
                    })
                
                await Promise.all(data)
                await Promise.all(allObjects)

            })

            await Promise.all(b)

            res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=*Vital${numb}*.csv`
            });
            

            // console.log(data.length)
            // let bb = await Promise.all(data)
            // bb.map((d : any) => {
            //     d.map((a : any) => {
            //         var arr = [];
            //         arr.push(a.ADM_RowId);
            //         arr.push(a.Patient_RowId);
            //         arr.push(a.ADM_No);
            //         arr.push(a.ADM_Date);
            //         arr.push(a.ADM_Time);

            //         allObjects.push(arr)
            //     })
            // })

            await Promise.all(allObjects)
            console.log(allObjects.length)
            var csvContent = "";
            allObjects.forEach(function (infoArray : any, index : any) {
                var dataString = infoArray.join(",");
                csvContent += index < allObjects.length ? dataString + "\n" : dataString;
            });
            await Promise.all(csvContent)
            // Returning the CSV output
            // // await console.log(listRowID.length)
            // await console.log(numFruits.length)
            await res.end(csvContent, "binary");

            console.log('finish')


        }
    }

    getPatientMedication() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = `select HN, ADM_RowId from TrueEye.Patient_Adm
            INNER JOIN TrueEye.Patient_Info ON TrueEye.Patient_Adm.Patient_RowId = TrueEye.Patient_Info.Patient_RowId
            WHERE ADM_No IS NOT NULL  LIMIT  700, 700 `
            let listRowID = await repos.query(query)

            repos = di.get('cache')
            console.log(listRowID.length)
            await listRowID.map(async (d : any) => {
                let result: any = await new Promise((resolve, reject) => {
                    repos.reserve((err : any, connObj : any) => {
                        if (connObj) {
                            let conn = connObj.conn;
                            conn.createStatement((err : any, statement : any) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    statement.setFetchSize(100, function (err : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            const query = `SELECT DISTINCT OEORI_ItmMast_DR, OEORI_ItmMast_DR->ARCIM_Code, OEORI_ItmMast_DR->ARCIM_Desc, OEORI_ItmMast_DR->ARCIM_Generic_DR, OEORI_ItmMast_DR->ARCIM_Generic_DR->PHCGE_Code,OEORI_ItmMast_DR->ARCIM_Generic_DR->PHCGE_Name, OEORD_RowId, OEORD_Adm_DR "PAADM_RowId", OEORD_Adm_DR->PAADM_ADMNo, PAADM_ADMDate                                                                                           
                                        ,PHCD_PHCSC_DR->PHCSC_Code AS PharItemSubcateCode, PHCD_PHCSC_DR->PHCSC_Desc AS PharItemSubcateDesc
                                        ,PHCD_PHCSC_DR->PHCSC_PHCC_ParRef->PHC_SubCat->PHCSC_PHCC_ParRef->PHCC_Code AS PharItemCateCode, PHCD_PHCSC_DR->PHCSC_PHCC_ParRef->PHC_SubCat->PHCSC_PHCC_ParRef->PHCC_Desc AS PharItemCateDesc
                                        FROM OE_Order
                                    INNER JOIN PA_ADM ON OE_Order.OEORD_Adm_DR = PA_ADM.PAADM_RowID
                                    INNER JOIN OE_OrdItem ON OE_Order.OEORD_RowId1 = OE_OrdItem.OEORI_OEORD_ParRef
                                    INNER JOIN ARC_ItmMast ON ARC_ItmMast.ARCIM_RowId = OE_OrdItem.OEORI_ItmMast_DR
                                    INNER JOIN PHC_DrgMast ON ARC_ItmMast.ARCIM_Code = PHC_DrgMast.PHCD_Code
                                    WHERE OEORD_Adm_DR = ${
                                                d.ADM_RowId
                                            }`;

                                            statement.executeQuery(query, function (err : any, resultset : any) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resultset.toObjArray(function (err : any, results : any) {
                                                        resolve(results);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            repos.release(connObj, function (err : any) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                });

                repos = di.get('repos')
                await result.map(async (d : any) => {


                    query = `INSERT INTO TrueEye.Patient_Medication SET ?`
                    await repos.query(query, d)
                })
            })
            console.log('finish')


        }
    }

    getPatientICD10() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = `select HN, ADM_RowId from TrueEye.Patient_Adm
            INNER JOIN TrueEye.Patient_Info ON TrueEye.Patient_Adm.Patient_RowId = TrueEye.Patient_Info.Patient_RowId
            WHERE ADM_No IS NOT NULL  LIMIT  700, 700 `
            let listRowID = await repos.query(query)

            repos = di.get('cache')
            console.log(listRowID.length)
            listRowID.map(async (d : any) => {
                let result: any = await new Promise((resolve, reject) => {
                    repos.reserve((err : any, connObj : any) => {
                        if (connObj) {
                            let conn = connObj.conn;
                            conn.createStatement((err : any, statement : any) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    statement.setFetchSize(100, function (err : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            const query = `CALL Custom_THSV_Report_ZEN_StoredProc.SVNHRptEPRDiag_GetDiag(${
                                                d.ADM_RowId
                                            })`;

                                            statement.executeQuery(query, function (err : any, resultset : any) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resultset.toObjArray(function (err : any, results : any) {
                                                        resolve(results);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            repos.release(connObj, function (err : any) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                });

                repos = di.get('repos')
                await result.map(async (data : any) => {

                    data.ADM_RowId = d.ADM_RowId
                    console.log(data)
                    // query = `INSERT INTO TrueEye.Patient_ICD10 SET ?`
                    // await repos.query(query, data)
                })
            })
            console.log('finish')


        }
    }

    getPatientData() {
        return async (req : Request, res : Response) => {
            let {national_id, passport, reference, otp} = req.query

            let repos = di.get('repos')
            const neo4j = require('neo4j-driver')

            const driver = neo4j.driver('bolt://10.105.107.65:7687', neo4j.auth.basic(neo4jSetting.USER, neo4jSetting.PASSWORD))
            const session = driver.session();
            let condition = ''
            if (!_.isEmpty(national_id)) {
                condition = `replace(replace(n.PAPER_ID," ",""),"-","") = '${national_id}'`
            } else {
                condition = `replace(replace(n.PassportNumber," ",""),"-","" = '${passport}`
            }
            let neo4jquery = `MATCH (n:PA_Person) WHERE ${condition} RETURN n`
            await session.run(neo4jquery).then(function (result : any) {
                if (result.records.length > 0) {
                    let body = {
                        Identifier: !_.isEmpty(national_id) ? national_id : passport,
                        Reference: reference,
                        OTP: otp

                    }
                    repos = di.get('repos')
                    let query = `REPLACE INTO consent_management.OTP_Request SET ?`
                    repos.query(query, body)

                    let mail_from = "noreply@samitivej.co.th"
                    let mail_to = "numpon@lbsconsultant.com"
                    // let mail_to = "Pratarn.Ch@samitivej.co.th"
                    let mail_subject = "Samitivej OTP"
                    let mail_body = `Samitivej Ref:${reference} (within 15 minute) OTP code is ${otp}`
                    axios({
                        method: 'post',
                        url: `http://10.105.10.50:8014/Service/sendEmailAPI`,
                        data: {
                            mail_from,
                            mail_to,
                            mail_subject,
                            mail_body
                        }
                    })
                    res.send({result, body})
                } else {
                    res.send(null)
                }
                // console.log(result.records.length);
                // return result.records.map((record : any) => {
                //     console.log(record.get("n"));
                // });
            }).catch((e : any) => { // Output the error
                console.log(e);
            }).then(() => { // Close the Session
                return session.close();
            }).then(() => { // Close the Driver
                return driver.close();
            });


            // let result: any = await new Promise((resolve, reject) => {
            //     repos.reserve((err : any, connObj : any) => {
            //         if (connObj) {
            //             let conn = connObj.conn;

            //             conn.createStatement((err : any, statement : any) => {
            //                 if (err) {
            //                     reject(err);
            //                 } else {
            //                     statement.setFetchSize(100, function (err : any) {
            //                         if (err) {
            //                             reject(err);
            //                         } else {

            //                             let query = `SELECT DISTINCT PAPMI_RowId "TC_RowId",'' "TC_RowIdHash", PAPMI_No "HN", PAPER_PassportNumber "Passport",
            //           PAPMI_ID "NationalID",  PAPMI_Title_DR "Title", PAPMI_Name "FirstName", PAPMI_Name2 "LastName",
            //           tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
            //           PAPMI_Sex_DR "Gender",
            //           PAPER_Nation_DR "Nationality",
            //           PAPER_Religion_DR "Religion",
            //           PAPMI_MobPhone "MobilePhone",
            //           PAPMI_Email "Email",
            //           PAPMI_PrefLanguage_DR "Language",
            //           '' "LinkExpireDate"
            //           FROM PA_PatMas
            //           INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
            //           WHERE `;
            //                             if (!_.isEmpty(national_id)) {
            //                                 query += ` REPLACE(PAPER_ID,' ','') = '${
            //                                     national_id
            //                                 }' `
            //                             } else {
            //                                 query += ` PAPER_PassportNumber = '${
            //                                     passport
            //                                 }' `
            //                             }

            //                             statement.executeQuery(query, function (err : any, resultset : any) {
            //                                 if (err) {
            //                                     reject(err);
            //                                 } else {
            //                                     resultset.toObjArray(function (err : any, results : any) {
            //                                         if (results.length > 0) {

            //                                             let body = {
            //                                                 Identifier: !_.isEmpty(national_id) ? national_id : passport,
            //                                                 Reference: reference,
            //                                                 OTP: otp

            //                                             }
            //                                             repos = di.get('repos')
            //                                             let query = `REPLACE INTO consent_management.OTP_Request SET ?`
            //                                             repos.query(query, body)

            //                                             let mail_from = "noreply@samitivej.co.th"
            //                                             let mail_to = "numpon@lbsconsultant.com"
            //                                             // let mail_to = "Pratarn.Ch@samitivej.co.th"
            //                                             let mail_subject = "Samitivej OTP"
            //                                             let mail_body = `Samitivej Ref:${reference} (within 15 minute) OTP code is ${otp}`
            //                                             axios({
            //                                                 method: 'post',
            //                                                 url: `http://10.105.10.50:8014/Service/sendEmailAPI`,
            //                                                 data: {
            //                                                     mail_from,
            //                                                     mail_to,
            //                                                     mail_subject,
            //                                                     mail_body
            //                                                 }
            //                                             })
            //                                             res.send({result, body})
            //                                         } else {
            //                                             console.log('2222')
            //                                             res.send(null)
            //                                         }
            //                                         resolve(results);
            //                                     });
            //                                 }
            //                             });
            //                         }
            //                     });
            //                 }
            //             });
            //             repos.release(connObj, function (err : any) {
            //                 if (err) {
            //                     console.log(err);
            //                 }
            //             });
            //         }
            //     });
            // });


        }
    }

    getCaptcha() {
        return async (req : Request, res : Response) => {
            let {site} = req.query
            var svgCaptcha = require('svg-captcha');
            let option = {
                size: 6, // size of random string
                noise: 5, // number of noise lines
                color: true, // characters will have distinct colors instead of grey, true if background option is set
                background: '#cc9966' // background color of the svg image
            }

            var captcha = svgCaptcha.create(option, 'text');
            res.status(200).send(captcha);


        }
    }

    postCaptcha() {
        return async (req : Request, res : Response) => {
            var svgCaptcha = require('svg-captcha');
            let option = {
                size: 6, // size of random string
                noise: 5, // number of noise lines
                color: true, // characters will have distinct colors instead of grey, true if background option is set
                background: '#cc9966' // background color of the svg image
            }

            var captcha = svgCaptcha.create(option, 'text');
            res.status(200).send(captcha);


        }
    }

    test() {
        return async (req : Request, res : Response) => {
            let {identifier, otp, reference} = req.query
            delete axios.defaults.baseURL
            axios.get(`http://10.105.10.29:1881/verifypatientdata?national_id=1341400135163&passport=null`)
        }
    }

    verifyOTP() {
        return async (req : Request, res : Response) => {
            let {identifier, otp, reference} = req.query
            let repos = di.get('repos')

            let query = `SELECT * FROM consent_management.OTP_Request WHERE Identifier = '${identifier}' 
            AND Reference = '${reference}' AND OTP = '${otp}' AND ExpireTime > NOW()`
            let data = await repos.query(query)


            res.send(data)
        }
    }

    getInfo() {
        return async (req : Request, res : Response) => {
            let {rowIdHash} = req.query
            let repos = di.get('repos')
            let date = new Date()
            let linkexpiredate = date.getFullYear() + "-" + (
                "0" + (
                    date.getMonth() + 1
                )
            ).slice(-2) + "-" + date.getDate()
            let query = `SELECT * FROM consent_management.Patient_Data WHERE TC_RowIdHash = '${rowIdHash}' AND LinkExpireDate < ${linkexpiredate}`
            let result = await repos.query(query)
            if (result.length > 0) {
                res.send(result[0])
            }


        }
    }
    getGender() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = `SELECT * FROM preregistration_drivethru.CT_Sex`
            let result = await repos.query(query)
            res.send(result)
        }
    }
    getReligion() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = `SELECT * FROM preregistration_drivethru.CT_Religion WHERE ID = 4 UNION 
       SELECT * FROM preregistration_drivethru.CT_Religion WHERE ID != 10 AND ID != 4 `

            let result = await repos.query(query)
            let response = result.map((d : any) => {
                return {"ID": d.ID, "Desc": d.Desc}
            })
            res.send(response)
        }
    }
    getProvince() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = ''
            query = `SELECT * FROM preregistration_drivethru.CT_Province WHERE Code NOT IN ('999', '900') `

            let result = await repos.query(query)
            res.send(result)
        }
    }


    getCity() {
        return async (req : Request, res : Response) => {
            let {provinceid} = req.query
            let repos = di.get('repos')
            let query = ''
            query = `SELECT ca.* FROM preregistration_drivethru.CT_City ca `

            if (!_.isEmpty(provinceid) && provinceid !== 'undefined') 
                query += `WHERE ca.Province_ID = '${provinceid}' `


            


            let result = await repos.query(query)
            let response: any
            response = await result.map((d : any) => {
                return {ID: d.ID, Desc: d.Desc}
            })

            res.send(response)
        }
    }

    testMail() {
        return async (req : Request, res : Response) => {
            const nodemailer = require("nodemailer");
            let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: "DC-EXCHC.BDMS.CO.TH", port: 25, secure: false, // true for 465, false for other ports
                auth: {
                    user: "sysadmin@samitivej.co.th", // generated ethereal user
                    pass: "Pa$$w0rd!", // generated ethereal password
                    tls: {
                        rejectUnauthorized: false
                    }
                }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: 'numpon.sk@hotmail.com', // sender address
                to: "numpontae09@gmail.com", // list of receivers
                subject: "Hello ✔", // Subject line
                text: "Hello world?", // plain text body
                html: "<b>Hello world?</b>", // html body
            });
            console.log("Message sent: %s", info.messageId);
        }
    }

    getCityArea() {
        return async (req : Request, res : Response) => {
            let {cityid} = req.query
            let repos = di.get('repos')
            let query = ''

            query = `SELECT ca.* FROM preregistration_drivethru.CT_Cityarea ca `

            if (!_.isEmpty(cityid) && cityid !== 'undefined') 
                query += `WHERE ca.City_ID = '${cityid}'`


            


            let result = await repos.query(query)
            let response: any
            response = await result.map((d : any) => {
                return {ID: d.ID, Desc: d.Desc}
            })
            res.send(response)
        }
    }
    getZip() {
        return async (req : Request, res : Response) => {
            let {provinceid, cityid, cityareaid} = req.query
            let repos = di.get('repos')
            let query = ''
            query = `SELECT *  FROM preregistration_drivethru.CT_Zip `

            if (!_.isEmpty(provinceid) && !_.isEmpty(cityid) && !_.isEmpty(cityareaid)) 
                query += `Where Province_ID = '${provinceid}' AND City_ID = '${cityid}' AND Cityarea_ID = '${cityareaid}' `


            


            let result = await repos.query(query)
            res.send(result)
        }
    }

    postPatientList() {
        return async (req : Request, res : Response) => {
            let data = req.body
            let repos = di.get('repos')
            try {
                await req.body.map((d : any) => {
                    let linkexpiredate = new Date()
                    linkexpiredate.setDate(linkexpiredate.getDate() + 7)
                    d.LinkExpireDate = linkexpiredate
                    console.log(d)
                    // let hash = CryptoJS.algo.SHA256.create();
                    // hash.update(d.TC_RowId.toString() + linkexpiredate.toString());
                    // d.TC_RowIdHash = hash.finalize().toString();

                    // let queryInfo = `REPLACE INTO consent_management.Patient_Data SET ?`
                    let queryInfo = `REPLACE INTO Consent_Send_Email_Prepare.patient_data SET ?`

                    repos.query(queryInfo, d);
                    res.send({status: 200})
                })
            } catch (error) {
                res.send({status: 404})
            }


            // let repos = di.get("repos");
            // try {
            // let test = axios({method: 'post',url:`http://10.105.10.29:1881/onetrust_consent_post`, data:  {national_id, site, consentData}})
            // .then(function (response) {
            // res.send({status: 200})
            // }).catch(function (error) {
            // res.send({status: 404})
            // //res.send(response.data)
            // })


            // } catch (error) {
            // console.log(error);
            // res.status(404).json([])
            // }
        }
    }


    verifyPatientData() {
        return async (req : Request, res : Response) => {
            let data = req.body
            let repos = di.get('repos')
            try {
                repos = di.get("cache");
                let result: any = await new Promise((resolve, reject) => {
                    repos.reserve((err : any, connObj : any) => {
                        if (connObj) {
                            let conn = connObj.conn;

                            conn.createStatement((err : any, statement : any) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    statement.setFetchSize(100, function (err : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            let query = `SELECT PAPER_PAPMI_DR->PAPMI_No
                      FROM PA_Person
                      WHERE PAPER_Name = '${
                                                data.firstname
                                            }' 
                      AND PAPER_Name2 = '${
                                                data.lastname
                                            }' 
                      AND PAPER_DOB = '${
                                                data.dob.slice(0, 10)
                                            }' 
                      AND PAPER_MobPhone = '${
                                                data.phone_no
                                            }' 
                      AND PAPER_Email = '${
                                                data.email
                                            }'`;

                                            if (!_.isEmpty(data.national_id)) {
                                                query += `AND PAPER_ID = '${
                                                    data.national_id
                                                }' `
                                            }

                                            statement.executeQuery(query, function (err : any, resultset : any) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resultset.toObjArray(function (err : any, results : any) {
                                                        resolve(results);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            repos.release(connObj, function (err : any) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                });
                console.log(result)
                let mail_from = "Samitivej_NoReplay@samitivej.co.th"
                let mail_to = "numpontae09@gmail.com"
                let mail_subject = "Test Test"
                let mail_body = "Test Test Body"
                let test = axios({
                    method: 'post',
                    url: `http://10.105.10.50:8014/Service/sendEmailAPI`,
                    data: {
                        mail_from,
                        mail_to,
                        mail_subject,
                        mail_body
                    }
                }).then(function (response) {
                    res.send({status: 200})
                }).catch(function (error) {
                    res.send({status: 404})
                })


                // repos = di.get("cache");
                // let result: any = await new Promise((resolve, reject) => {
                // repos.reserve((err: any, connObj: any) => {
                //     if (connObj) {
                //       let conn = connObj.conn;

                //       conn.createStatement((err: any, statement: any) => {
                //         if (err) {
                //           reject(err);
                //         } else {
                //           statement.setFetchSize(100, function (err: any) {
                //             if (err) {
                //               reject(err);
                //             } else {
                //                console.log('1111')

                //               const query = `SELECT DISTINCT PAPMI_RowId "TC_RowId",'' "TC_RowIdHash", PAPMI_No "HN", PAPER_PassportNumber "Passport",
                //               PAPMI_ID "NationalID",  PAPMI_Title_DR "Title", PAPMI_Name "FirstName", PAPMI_Name2 "LastName",
                //               tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
                //               PAPMI_Sex_DR "Gender",
                //               PAPER_Nation_DR "Nationality",
                //               PAPER_Religion_DR "Religion",
                //               PAPMI_MobPhone "MobilePhone",
                //               PAPMI_Email "Email",
                //               PAPMI_PrefLanguage_DR "Language",
                //               '' "LinkExpireDate"
                //               FROM PA_PatMas
                //               INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                //               INNER JOIN PA_Adm ON PA_PatMas.PAPMI_RowId = PA_Adm.PAADM_PAPMI_DR
                //               WHERE YEAR(PAADM_AdmDate) BETWEEN 2021 AND 2021 AND PAADM_AdmNo IS NOT NULL AND PAADM_VisitStatus <> 'C' AND PAADM_VisitStatus <> 'Cancelled'`;
                //               statement.executeQuery(query, function (
                //                 err: any,
                //                 resultset: any
                //               ) {
                //                 if (err) {
                //                   reject(err);
                //                 } else {
                //                   resultset.toObjArray(function (
                //                     err: any,
                //                     results: any
                //                   ) {
                //                     resolve(results);
                //                   });
                //                 }
                //               });
                //             }
                //           });
                //         }
                //       });
                //       repos.release(connObj, function (err: any) {
                //         if (err) {
                //           console.log(err);
                //         }
                //       });
                //     }
                // });
                // });

                // await req.body.map((d:any) => {
                // let linkexpiredate = new Date()
                // linkexpiredate.setDate(linkexpiredate.getDate() + 7)
                // d.LinkExpireDate = linkexpiredate
                // console.log(d)

                // let queryInfo = `REPLACE INTO Consent_Send_Email_Prepare.patient_data SET ?`

                // repos.query(queryInfo, d);
                // res.send({status: 200})
                // })
            } catch (error) {
                res.send({status: 404})
            }


            // let repos = di.get("repos");
            // try {
            // let test = axios({method: 'post',url:`http://10.105.10.29:1881/onetrust_consent_post`, data:  {national_id, site, consentData}})
            // .then(function (response) {
            // res.send({status: 200})
            // }).catch(function (error) {
            // res.send({status: 404})
            // //res.send(response.data)
            // })


            // } catch (error) {
            // console.log(error);
            // res.status(404).json([])
            // }
        }
    }


}


const router = Router()
const route = new ctRoute()

router.get("/patientinfo", route.getPatientInfo()).get("/patientsocial", route.getPatientSocial()).get("/patientadm", route.getPatientADM()).get("/patientlab", route.getPatientLab()).get("/patientvitalsign", route.getPatientVitalSign()).get("/patientmedication", route.getPatientMedication()).get("/patienticd10", route.getPatientICD10())

export const patient = router
