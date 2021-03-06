import {Request, Response, Router} from "express";
import {di} from "../di";
import * as _ from "lodash";
import CryptoJS from "crypto-js";
const axios = require('axios');
import {rpaSetting} from "../config/config";
import moment from 'moment-timezone';
moment.tz.setDefault('Asia/Bangkok');


class registerRoute {
    async handleConsent(data : any, id : any) {
        let repos = di.get("repos")
        let query_1 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '1', '${
            data.consent_1.text
        }', ${
            data.consent_1.status
        })`
        let query_2_1 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_1', '${
            data.consent_2_1.text
        }', ${
            data.consent_2_1.status
        })`
        let query_2_2 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_2', '${
            data.consent_2_2.text
        }', ${
            data.consent_2_2.status
        })`
        let query_2_3 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_3', '${
            data.consent_2_3.text
        }', ${
            data.consent_2_3.status
        })`
        let query_2_4 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_4', '${
            data.consent_2_4.text
        }', ${
            data.consent_2_4.status
        })`
        let query_2_5_1 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_5_1', '${
            data.consent_2_5_1.text
        }', ${
            data.consent_2_5_1.status
        })`
        let query_2_5_2 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_5_2', '${
            data.consent_2_5_2.text
        }', ${
            data.consent_2_5_2.status
        })`
        let query_2_5_3 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_5_3', '${
            data.consent_2_5_3.text
        }', ${
            data.consent_2_5_3.status
        })`
        await repos.query(query_1)
        await repos.query(query_2_1)
        await repos.query(query_2_2)
        await repos.query(query_2_3)
        await repos.query(query_2_4)
        await repos.query(query_2_5_1)
        await repos.query(query_2_5_2)
        await repos.query(query_2_5_3)
        if (data.other.choice_1.status === true) {
            let query = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, 'other_1', '${
                data.other.choice_1.text
            }', ${
                data.other.choice_1.status
            })`
            repos.query(query)
        }
        if (data.other.choice_2.status === true) {
            let query = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, 'other_2', '${
                data.other.choice_2.text
            }', ${
                data.other.choice_2.status
            })`
            repos.query(query)
        }
        if (data.other.choice_3.status === true) {
            let query = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, 'other_3', '${
                data.other.choice_3.text
            }', ${
                data.other.choice_3.status
            })`
            repos.query(query)
        }
        if (data.other.choice_4.status === true) {
            let query = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, 'other_4', '${
                data.other.choice_4.text
            }', ${
                data.other.choice_4.status
            })`
            repos.query(query)
        }
        return
    }
    Capitalize = (s : any) => {
        if (typeof s !== "string") 
            return "";
        
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    sendRPA() {
        return
    }
    async getPatientByIdFromDB(uid : string) {
        let repos = di.get("repos");
        let query = `SELECT PI.* FROM Registration.Patient_Info PI`
        query += ` WHERE 1 = 1`
        query += ` AND PI.UID = '${uid}'`
        let info = await repos.query(query)
        if (info[0].Type == 0) {
            let queryAddress = `SELECT * FROM Registration.Patient_Address WHERE PatientID = ${
                info[0].ID
            } ORDER BY Type`
            let queryEmergency = `SELECT * FROM Registration.Patient_Emergency WHERE PatientID = ${
                info[0].ID
            }`
            let queryFinancial = `SELECT * FROM Registration.Patient_Financial WHERE PatientID = ${
                info[0].ID
            }`
            let queryHistory = `SELECT * FROM Registration.Patient_History WHERE PatientID = ${
                info[0].ID
            }`
            let queryFamily = `SELECT * FROM Registration.Family_History WHERE PatientID = ${
                info[0].ID
            }`
            let querySocial = `SELECT * FROM Registration.Patient_Social WHERE PatientID = ${
                info[0].ID
            }`
            let queryConsent = `SELECT * FROM Registration.Consent WHERE PatientID = ${
                info[0].ID
            }`
            let queryPatientSignature = `SELECT Signature, Createdate, Createtime FROM Registration.Signature Where PatientID = ${
                info[0].ID
            } And SignType = 'Patient' Order By ID Desc`
            let queryStaffSignature = `SELECT Signature, Createdate, Createtime FROM Registration.Signature Where PatientID = ${
                info[0].ID
            } And SignType = 'Approver' Order By ID Desc`


            let address = await repos.query(queryAddress)
            let emergency = await repos.query(queryEmergency)
            let financial = await repos.query(queryFinancial)
            let history = await repos.query(queryHistory)
            let family = await repos.query(queryFamily)
            let social = await repos.query(querySocial)
            let consent = await repos.query(queryConsent)
            let patientSignature = await repos.query(queryPatientSignature)
            if (patientSignature.length > 0) 
                patientSignature[0].Createdate.setHours(patientSignature[0].Createdate.getHours() + 7);
            
            let staffSignature = await repos.query(queryStaffSignature)
            if (staffSignature.length > 0) 
                staffSignature[0].Createdate.setHours(staffSignature[0].Createdate.getHours() + 7);
            

            let dataSocial = social.map((d : any) => {
                let data = {
                    Habit: d.Habit,
                    Status: d.Status,
                    Quantity: d.Quantity,
                    DurationQuantity: d.DurationQuantity,
                    DurationUnit: d.DurationUnit,
                    Detail: JSON.parse(d.Detail),
                    Comment: d.Comment
                }
                return data
            })
            let payment = []
            let familylist: any = []
            if (financial.length) {
                if (financial[0].SelfPay == 1) 
                    payment.push('Self pay')
                
                if (financial[0].CompanyContact == 1) 
                    payment.push('Company contract')
                
                if (financial[0].Insurance == 1) 
                    payment.push('Insurance')
                
            }
            family.map((d : any) => {
                let data = {
                    illness: d.Disease,
                    person: d.Person
                }
                familylist.push(data)
            })
            let result = {
                Info: info[0],
                Present: address[0],
                Permanent: address[1],
                Emergency: {
                    Firstname: emergency[0].Firstname,
                    Lastname: emergency[0].Lastname,
                    Relation: emergency[0].Relation,
                    sameAddress: emergency[0].sameAddress,
                    Country: emergency[0].Country,
                    Province: emergency[0].Province,
                    Postcode: emergency[0].Postcode,
                    Subdistrict: emergency[0].Subdistrict,
                    District: emergency[0].District,
                    Address: emergency[0].Address,
                    PhoneNo: emergency[0].PhoneNo,
                    Email: emergency[0].Email
                },
                Financial: {
                    payment_method: payment,
                    showInsurance: financial[0].Insurance == 1 ? true : false,
                    showCompany: financial[0].CompanyContact == 1 ? true : false,
                    InsuranceDesc: financial[0].InsuranceDesc,
                    CompanyDesc: financial[0].CompanyDesc,
                    PaymentAs: financial[0].PaymentAs,
                    Title: financial[0].Title,
                    Firstname: financial[0].Firstname,
                    Lastname: financial[0].Lastname,
                    DOB: financial[0].DOB,
                    Aforemention: financial[0].Aforemention
                },
                History: {
                    MaritalStatus: history[0].MaritalStatus,
                    Children: history[0].Children,
                    Diseases: JSON.parse(history[0].Diseases),
                    Medication: history[0].Medication == null ? history[0].Medication : history[0].Medication == 1 ? true : false,
                    CommentMedication: history[0].CommentMedication,
                    Hospitalization: history[0].Hospitalization == null ? history[0].Hospitalization : history[0].Hospitalization == 1 ? true : false,
                    CommentHospitalization: history[0].CommentHospitalization,
                    Physical: history[0].Physical == null ? history[0].Physical : history[0].Physical == 1 ? true : false,
                    CommentPhysical: history[0].CommentPhysical,
                    Exercise: history[0].Exercise == null ? history[0].Exercise : history[0].Exercise == 1 ? true : false,
                    Pregnant: history[0].Pregnant == null ? history[0].Pregnant : history[0].Pregnant == 1 ? true : false,
                    CommentPregnant: history[0].CommentPregnant,
                    Giver: history[0].Giver == null ? history[0].Giver : history[0].Giver == 1 ? true : false,
                    CommentGiver: history[0].CommentGiver,
                    AbsenceFromWork: history[0].AbsenceFromWork == 1 ? true : false,
                    Reimbursement: history[0].Reimbursement == 1 ? true : false,
                    GovernmentReimbursement: history[0].GovernmentReimbursement == 1 ? true : false,
                    StateEnterprise: history[0].StateEnterprise == 1 ? true : false,
                    Authorize: history[0].Authorize == null ? history[0].Authorize : history[0].Authorize == 1 ? true : false,
                    CommentAuthorize: history[0].CommentAuthorize,
                    Spiritual: history[0].Spiritual == null ? history[0].Spiritual : history[0].Spiritual == 1 ? true : false,
                    CommentSpiritual: history[0].CommentSpiritual,
                    Allergies: history[0].Allergies == null ? history[0].Allergies : history[0].Allergies == 1 ? true : false,
                    CommentAllergies: history[0].CommentAllergies,
                    Alcohol: history[0].Alcohol == null ? history[0].Alcohol : history[0].Alcohol == 1 ? true : false,
                    DrugAbuse: history[0].DrugAbuse == null ? history[0].DrugAbuse : history[0].DrugAbuse == 1 ? true : false,
                    Smoke: history[0].Smoke == null ? history[0].Smoke : history[0].Smoke == 1 ? true : false,
                    FatherAlive: history[0].FatherAlive == null ? history[0].FatherAlive : history[0].FatherAlive == 1 ? true : false,
                    FatherAge: history[0].FatherAge,
                    CauseFather: history[0].CauseFather,
                    MotherAlive: history[0].MotherAlive == null ? history[0].MotherAlive : history[0].MotherAlive == 1 ? true : false,
                    MotherAge: history[0].MotherAge,
                    CauseMother: history[0].CauseMother
                },
                Family: familylist,
                SocialHistory: dataSocial,
                Consent: consent,
                PatientSignature: patientSignature[0],
                StaffSignature: staffSignature[0]

            }
            return result
        } else {
            let queryAddress = `SELECT * FROM Registration.Patient_Address WHERE PatientID = ${
                info[0].ID
            } ORDER BY Type`
            let queryParent = `SELECT p.* FROM Registration.Parent p WHERE p.PatientID = ${
                info[0].ID
            }`
            let queryFinancial = `SELECT * FROM Registration.Patient_Financial WHERE PatientID = ${
                info[0].ID
            }`
            let queryFamily = `SELECT * FROM Registration.Family_History WHERE PatientID = ${
                info[0].ID
            }`
            let queryPediatric = `SELECT * FROM Registration.Pediatric WHERE PatientID = ${
                info[0].ID
            }`
            let queryConsent = `SELECT * FROM Registration.Consent WHERE PatientID = ${
                info[0].ID
            }`
            let address = await repos.query(queryAddress)
            let parent = await repos.query(queryParent)
            let financial = await repos.query(queryFinancial)
            let family = await repos.query(queryFamily)
            let pediatric = await repos.query(queryPediatric)
            let consent = await repos.query(queryConsent)
            let payment = []
            let familylist: any = []
            let filterpresent = await address.filter((d : any) => d.Type == 0)
            let filterpermanent = await address.filter((d : any) => d.Type == 1)
            if (financial.length) {
                if (financial[0].SelfPay == 1) 
                    payment.push('Self pay')
                
                if (financial[0].CompanyContact == 1) 
                    payment.push('Company contract')
                
                if (financial[0].Insurance == 1) 
                    payment.push('Insurance')
                
            }
            await family.map((d : any) => {
                let data = {
                    illness: d.Disease,
                    person: d.Person
                }
                familylist.push(data)
            })
            let result = {
                Info: info[0],
                Present: filterpresent[0],
                Permanent: filterpermanent[0],
                Parent: parent,
                Financial: {
                    payment_method: payment,
                    showInsurance: financial[0].Insurance == 1 ? true : false,
                    showCompany: financial[0].CompanyContact == 1 ? true : false,
                    InsuranceDesc: financial[0].InsuranceDesc,
                    CompanyDesc: financial[0].CompanyDesc
                },
                Pediatric: pediatric[0],
                Family: familylist,
                Consent: consent
            }

            return result
        }
    }
    postRegister() {
        return async (req : Request, res : Response) => {
            let body = req.body;
            let repos = di.get("repos");
            if (body.type == 0) {


                let dateDob = new Date(body.patient_info.dob)
                dateDob.setHours(dateDob.getHours() + 7);
                let dataInfo = {
                    Title: body.patient_info.title,
                    Firstname: body.patient_info.firstnameth,
                    Middlename: body.patient_info.middlenameth,
                    Lastname: body.patient_info.lastnameth,
                    FirstnameEN: body.patient_info.firstname,
                    MiddlenameEN: body.patient_info.middlename,
                    LastnameEN: body.patient_info.lastname,
                    DOB: `${
                        dateDob.getFullYear()
                    }-${
                        ("0" + (
                            dateDob.getMonth() + 1
                        )).slice(-2)
                    }-${
                        ("0" + dateDob.getDate()).slice(-2)
                    }`,
                    Gender: body.patient_info.gender,
                    Nationality: body.patient_info.nationality,
                    Religion: body.patient_info.religion,
                    PreferredLanguage: body.patient_info.preferredlanguage,
                    Expatriate: body.patient_info.expatriate,
                    MaritalStatus: body.patient_info.marital_status,
                    NationalID: body.patient_info.national_id,
                    Passport: body.patient_info.passport,
                    Occupation: body.patient_info.occupation,
                    PhoneNo: body.patient_info.phone_no,
                    Email: body.patient_info.email,
                    Homephone: body.patient_info.homephone,
                    Officephone: body.patient_info.officephone,
                    Confirm: 0,
                    Type: body.type,
                    Site: body.site,
                    DefaultLanguage: body.defaultlanguage
                }
                let queryInfo = `INSERT INTO Registration.Patient_Info SET ?`
                let insertInfo = await repos.query(queryInfo, dataInfo);
                // -- //
                let dataAddress: any = new Array()
                let presentAddress = [
                    insertInfo.insertId,
                    body.present.country,
                    body.present.postcode,
                    body.present.subdistrict,
                    body.present.districtid,
                    body.present.address,
                    body.present.provinceid,
                    null,
                    0
                ]
                let permanentAddress = [
                    insertInfo.insertId,
                    body.permanent.sameAddress ? body.present.country : body.permanent.country,
                    body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
                    body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
                    body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
                    body.permanent.sameAddress ? body.present.address : body.permanent.address,
                    body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
                    body.permanent.sameAddress,
                    1
                ]

                dataAddress.push(permanentAddress)
                dataAddress.push(presentAddress)

                let dataEmergency = {
                    PatientID: insertInfo.insertId,
                    Firstname: body.emergency.first_name,
                    Lastname: body.emergency.last_name,
                    Relation: body.emergency.relation,
                    Email: body.emergency.email,
                    PhoneNo: body.emergency.phone_no,
                    Country: body.emergency.sameAddress ? body.present.country : body.emergency.country,
                    Postcode: body.emergency.sameAddress ? body.present.postcode : body.emergency.postcode,
                    Subdistrict: body.emergency.sameAddress ? body.present.subdistrict : body.emergency.subdistrict,
                    District: body.emergency.sameAddress ? body.present.districtid : body.emergency.districtid,
                    Address: body.emergency.sameAddress ? body.present.address : body.emergency.address,
                    Province: body.emergency.sameAddress ? body.present.provinceid : body.emergency.provinceid,
                    sameAddress: body.emergency.sameAddress
                }
                let financialDob = new Date(body.financial.dob)
                financialDob.setHours(financialDob.getHours() + 7);
                let dataFinancial = {
                    PatientID: insertInfo.insertId,
                    SelfPay: _.indexOf(body.financial.payment_method, 'Self pay') >= 0 ? 1 : 0,
                    CompanyContact: _.indexOf(body.financial.payment_method, 'Company contract') >= 0 ? 1 : 0,
                    Insurance: _.indexOf(body.financial.payment_method, 'Insurance') >= 0 ? 1 : 0,
                    CompanyDesc: body.financial.company,
                    InsuranceDesc: body.financial.insurance,
                    PaymentAs: body.financial.payment_as,
                    Title: body.financial.title,
                    Firstname: body.financial.firstname,
                    Lastname: body.financial.lastname,
                    DOB: `${
                        financialDob.getFullYear()
                    }-${
                        ("0" + (
                            financialDob.getMonth() + 1
                        )).slice(-2)
                    }-${
                        ("0" + financialDob.getDate()).slice(-2)
                    }`,
                    Aforemention: body.financial.aforemention
                }
                let dataHistory = {
                    PatientID: insertInfo.insertId,
                    MaritalStatus: body.personal_history.marital_status,
                    Children: body.personal_history.children,
                    Diseases: JSON.stringify(body.personal_history.diseases),
                    Medication: body.personal_history.medication,
                    CommentMedication: body.personal_history.c_medication,
                    Hospitalization: body.personal_history.hospitalization,
                    CommentHospitalization: body.personal_history.c_hospitalization,
                    Physical: body.personal_history.physical,
                    CommentPhysical: body.personal_history.c_physical,
                    Exercise: body.personal_history.exercise.status,
                    Pregnant: body.personal_history.pregnant,
                    CommentPregnant: body.personal_history.c_pregnant,
                    Giver: body.personal_history.giver,
                    CommentGiver: body.personal_history.c_giver,
                    AbsenceFromWork: _.indexOf(body.personal_history.medical_certificate, 'absence') >= 0 ? 1 : 0,
                    Reimbursement: _.indexOf(body.personal_history.medical_certificate, 'reimbursement') >= 0 ? 1 : 0,
                    GovernmentReimbursement: _.indexOf(body.personal_history.doctor_certificate, 'government_reimbursement') >= 0 ? 1 : 0,
                    StateEnterprise: _.indexOf(body.personal_history.doctor_certificate, 'state_enterprise') >= 0 ? 1 : 0,
                    Authorize: body.personal_history.authorize,
                    CommentAuthorize: body.personal_history.c_authorize,
                    Spiritual: body.personal_history.spiritual,
                    CommentSpiritual: body.personal_history.c_spiritual,
                    Allergies: body.personal_history.allergies,
                    CommentAllergies: body.personal_history.c_allergies,
                    Alcohol: body.personal_history.alcohol.status,
                    DrugAbuse: body.personal_history.drugabuse.status,
                    Smoke: body.personal_history.smoke.status,
                    FatherAlive: body.personal_history.father.alive,
                    FatherAge: body.personal_history.father.age,
                    CauseFather: body.personal_history.father.cause,
                    MotherAlive: body.personal_history.mother.alive,
                    MotherAge: body.personal_history.mother.age,
                    CauseMother: body.personal_history.mother.cause
                }
                // --- //
                let queryAddress = `INSERT INTO Registration.Patient_Address (PatientID, Country, Postcode, Subdistrict, District, Address, Province, sameAddress, Type) VALUES ?`
                let queryEmegency = `INSERT INTO Registration.Patient_Emergency SET ?`
                let queryFinancial = `INSERT INTO Registration.Patient_Financial SET ?`
                let queryHistory = `INSERT INTO Registration.Patient_History SET ?`
                // -- //
                await repos.query(queryAddress, [dataAddress]);
                await repos.query(queryEmegency, dataEmergency);
                await repos.query(queryFinancial, dataFinancial);
                await repos.query(queryHistory, dataHistory);
                if (body.personal_history.family.length > 0) {
                    body.personal_history.family.map(async (p : any) => {
                        let valuesFamily: any[] = []
                        if (p.person != null && p.illness != null) {
                            let queryCheckDisease = `SELECT * FROM Registration.CT_Diseases WHERE (DescEN = '${
                                p.illness
                            }' OR DescTH = '${
                                p.illness
                            }' OR ID = ${
                                p.illness
                            }) And ActiveFamilyHistory = 1 `
                            let queryCheckFamily = `SELECT * FROM Registration.CT_Relation WHERE (DescText like '%${
                                p.person
                            }%' OR ID = '${
                                p.person
                            }') And ActiveFamilyHistory = 1 `
                            let dataPerson = await repos.query(queryCheckFamily)
                            let dataIllness = await repos.query(queryCheckDisease)
                            if (dataPerson.length > 0 && dataIllness.length > 0) {

                                let value = [
                                    insertInfo.insertId, dataPerson[0].ID,
                                    dataIllness[0].ID
                                ]
                                valuesFamily.push(value)
                            }
                        }
                        let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
                        if (valuesFamily.length) 
                            await repos.query(insertFamily, [valuesFamily])
                        
                    })

                }
                if (body.personal_history.exercise.status != null) {
                    let dataExercise = {
                        PatientID: insertInfo.insertId,
                        Habit: 'exercise',
                        Status: body.personal_history.exercise.status,
                        Quantity: body.personal_history.exercise.quantity,
                        Detail: null,
                        Comment: body.personal_history.exercise.comment
                    }
                    let insertExercise = `INSERT INTO Registration.Patient_Social SET ?`
                    await repos.query(insertExercise, dataExercise)
                }
                if (body.personal_history.alcohol.status != null) {
                    let dataAlcohol = {
                        PatientID: insertInfo.insertId,
                        Habit: 'alcohol',
                        Status: body.personal_history.alcohol.status,
                        Quantity: body.personal_history.alcohol.quantity,
                        DurationQuantity: body.personal_history.alcohol.duration.quantity,
                        DurationUnit: body.personal_history.alcohol.duration.unit,
                        Detail: JSON.stringify(body.personal_history.alcohol.detail),
                        Comment: body.personal_history.alcohol.comment
                    }
                    let insertAlcohol = `INSERT INTO Registration.Patient_Social SET ?`
                    await repos.query(insertAlcohol, dataAlcohol)
                }
                if (body.personal_history.drugabuse.status != null) {
                    let dataDrugabuse = {
                        PatientID: insertInfo.insertId,
                        Habit: 'drugabuse',
                        Status: body.personal_history.drugabuse.status,
                        Quantity: body.personal_history.drugabuse.quantity,
                        Detail: JSON.stringify(body.personal_history.drugabuse.detail),
                        Comment: body.personal_history.drugabuse.comment
                    }
                    let insertDrugabuse = `INSERT INTO Registration.Patient_Social SET ?`
                    await repos.query(insertDrugabuse, dataDrugabuse)
                }
                if (body.personal_history.smoke.status != null) {
                    let dataSmoke = {
                        PatientID: insertInfo.insertId,
                        Habit: 'smoke',
                        Status: body.personal_history.smoke.status,
                        Quantity: body.personal_history.smoke.quantity,
                        DurationQuantity: body.personal_history.smoke.duration.quantity,
                        DurationUnit: body.personal_history.smoke.duration.unit,
                        Detail: JSON.stringify(body.personal_history.smoke.detail),
                        Comment: body.personal_history.smoke.comment
                    }
                    let insertSmoke = `INSERT INTO Registration.Patient_Social SET ?`
                    await repos.query(insertSmoke, dataSmoke)
                }
                this.handleConsent(body.consent_form, insertInfo.insertId)

                const result = {
                    patientId: insertInfo.insertId,
                    message: 'Success'
                }
                res.send(result)

                // sendres.send({message: 'Success', patientId: insertInfo.insertId})
            } else if (body.type == 1) {
                let dateDob = new Date(body.general_info.dob)
                dateDob.setHours(dateDob.getHours() + 7);
                let dataInfo = {
                    Title: body.general_info.title,
                    Firstname: body.general_info.firstname,
                    Middlename: body.general_info.middlename,
                    Lastname: body.general_info.lastname,
                    FirstnameTH: body.general_info.firstnameth,
                    MiddlenameTH: body.general_info.middlenameth,
                    LastnameTH: body.general_info.lastnameth,
                    DOB: `${
                        dateDob.getFullYear()
                    }-${
                        ("0" + (
                            dateDob.getMonth() + 1
                        )).slice(-2)
                    }-${
                        ("0" + dateDob.getDate()).slice(-2)
                    }`,
                    Gender: body.general_info.gender,
                    Nationality: body.general_info.nationality,
                    Religion: body.general_info.religion,
                    PhoneNo: body.general_info.phone_no,
                    Email: body.general_info.email,
                    Confirm: 0,
                    Type: body.type,
                    Site: body.site,
                    DefaultLanguage: body.defaultlanguage
                }
                let queryInfo = `INSERT INTO Registration.Patient_Info SET ?`
                let insertInfo = await repos.query(queryInfo, dataInfo);
                let dataAddress: any = new Array()
                let presentAddress = [
                    insertInfo.insertId,
                    body.present.country,
                    body.present.postcode,
                    body.present.subdistrict,
                    body.present.districtidid,
                    body.present.address,
                    body.present.provinceidid,
                    null,
                    0
                ]
                let permanentAddress = [
                    insertInfo.insertId,
                    body.permanent.sameAddress ? body.present.country : body.permanent.country,
                    body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
                    body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
                    body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
                    body.permanent.sameAddress ? body.present.address : body.permanent.address,
                    body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
                    body.permanent.sameAddress,
                    1
                ]
                dataAddress.push(presentAddress)
                dataAddress.push(permanentAddress)
                let dataFinancial = {
                    PatientID: insertInfo.insertId,
                    SelfPay: _.indexOf(body.parent_info.payment_method, 'Self pay') >= 0 ? 1 : 0,
                    CompanyContact: _.indexOf(body.parent_info.payment_method, 'Company contract') >= 0 ? 1 : 0,
                    Insurance: _.indexOf(body.parent_info.payment_method, 'Insurance') >= 0 ? 1 : 0,
                    CompanyDesc: body.parent_info.company,
                    InsuranceDesc: body.parent_info.insurance
                }
                let dataPediatric = {
                    PatientID: insertInfo.insertId,
                    Pob: body.pediatric.pob,
                    BloodGroup: body.pediatric.blood_group,
                    Weight: body.pediatric.weight,
                    Height: body.pediatric.length,
                    head: body.pediatric.head,
                    Delivery: body.pediatric.delivery,
                    DeliveryScore1: body.pediatric.deliveryscore1,
                    DeliveryScore2: body.pediatric.deliveryscore2,
                    Tsh: body.pediatric.tsh,
                    Pku: body.pediatric.pku,
                    Hearing: body.pediatric.hearing,
                    Problems: body.pediatric.problems,
                    ProblemsComment: body.pediatric.c_problems,
                    Delay: body.pediatric.delay,
                    DelayComment: body.pediatric.c_delay,
                    Drug: body.pediatric.drug,
                    DrugComment: body.pediatric.c_drug,
                    Food: body.pediatric.food,
                    FoodComment: body.pediatric.c_food,
                    Other: body.pediatric.other,
                    Othercomment: body.pediatric.c_other,
                    Illness: body.pediatric.illness,
                    Curmed: body.pediatric.curmed,
                    Hospitalization: body.pediatric.hospitalization,
                    HospitalizationComment: body.pediatric.c_hospitalization,
                    Siblings: body.siblings.siblings
                }
                let queryAddress = `INSERT INTO Registration.Patient_Address (PatientID, Country, Postcode, Subdistrict, District, Address, Province, sameAddress, Type) VALUES ?`
                let queryFinancial = `INSERT INTO Registration.Patient_Financial SET ?`
                let queryPediatric = `INSERT INTO Registration.Pediatric SET ?`
                await repos.query(queryAddress, [dataAddress]);
                await repos.query(queryFinancial, dataFinancial);
                await repos.query(queryPediatric, dataPediatric);
                let valuesParent: any[] = []
                await body.parent_info.parent.map((d : any) => {
                    let parentdata = [
                        insertInfo.insertId,
                        d.title,
                        d.firstname,
                        d.middlename,
                        d.lastname,
                        d.relation,
                        d.phoneno,
                        d.email,
                        d.contactemergency,
                        d.livewithperson,
                        d.sameAddress ? body.present.country : d.country,
                        d.sameAddress ? body.present.postcode : d.postcode,
                        d.sameAddress ? body.present.subdistrict : d.subdistrict,
                        d.sameAddress ? body.present.districtid : d.districtid,
                        d.sameAddress ? body.present.address : d.address,
                        d.sameAddress ? body.present.provinceid : d.provinceid,
                        d.sameAddress
                    ]
                    valuesParent.push(parentdata)
                })

                let queryParent = `INSERT INTO Registration.Parent (PatientID, Title, Firstname, Middlename, Lastname, Relation, PhoneNo, Email, ContactEmergency, LivePerson, Country, Postcode, Subdistrict, District, Address, Province, sameAddress) VALUES ?`

                let queryCheckDisease = `SELECT * FROM Registration.CT_Diseases WHERE DescEN = '' AND DescTH = ''`


                await repos.query(queryParent, [valuesParent]);
                if (body.siblings.family.length > 0) {
                    body.siblings.family.map(async (p : any) => {
                        let valuesFamily: any[] = []
                        if (p.person != null && p.illness != null) {
                            let queryCheckDisease = `SELECT * FROM Registration.CT_Diseases WHERE (DescEN = '${
                                p.illness
                            }' OR DescTH = '${
                                p.illness
                            }' OR ID = ${
                                p.illness
                            }) And ActiveFamilyHistory = 1 `
                            let queryCheckFamily = `SELECT * FROM Registration.CT_Relation WHERE (DescText like '%${
                                p.person
                            }%' OR ID = '${
                                p.person
                            }') And ActiveFamilyHistory = 1 `
                            let dataPerson = await repos.query(queryCheckFamily)
                            let dataIllness = await repos.query(queryCheckDisease)
                            if (dataPerson.length > 0 && dataIllness.length > 0) {

                                let value = [
                                    insertInfo.insertId, dataPerson[0].ID,
                                    dataIllness[0].ID
                                ]
                                valuesFamily.push(value)
                            }
                        }
                        let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
                        if (valuesFamily.length) 
                            await repos.query(insertFamily, [valuesFamily])
                        
                    })

                }
                this.handleConsent(body.consent_form, insertInfo.insertId)
                res.send({message: 'Success'})
            }
        };
    }
    getPendingData() {
        return async (req : Request, res : Response) => {
            let {
                id,
                firstname,
                lastname,
                phone_no,
                passport,
                dateOfBirth,
                national_id,
                site,
                page
            } = req.body;
            let repos = di.get("repos");
            try {
                let startNum = (parseInt("1") * 15) - 15
                let LimitNum = 15

                let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Registration.Patient_Info PI`
                query += ` LEFT JOIN Registration.CT_Sex CTS ON CTS.Id = PI.Gender`
                query += ` WHERE Approve != 1`
                query += ` AND Confirm = 1`
                if (!_.isEmpty(firstname)) {
                    query += ` AND (PI.Firstname LIKE '%${firstname}%')`
                }
                if (!_.isEmpty(lastname)) {
                    query += ` AND (PI.Lastname LIKE '%${lastname}%')`
                }
                if (!_.isEmpty(phone_no)) {
                    query += ` AND PI.PhoneNo = '${phone_no}'`
                }
                if (!_.isEmpty(passport)) {
                    query += ` AND PI.Passport = '${passport}'`
                }
                if (!_.isEmpty(national_id)) {
                    query += ` AND PI.NationalID = '${national_id}'`
                }
                if (!_.isEmpty(dateOfBirth)) {
                    query += ` AND (PI.DOB = '${dateOfBirth}')`
                }

                query += ` AND Site IN ('${site}')`
                query += ` ORDER BY ID DESC LIMIT ${startNum},${LimitNum}`

                let queryCount = `SELECT COUNT(PI.ID) as count FROM Registration.Patient_Info PI`
                queryCount += ` WHERE Approve != 1`
                queryCount += ` AND Confirm = 1`
                if (!_.isEmpty(firstname)) {
                    queryCount += ` AND (PI.Firstname LIKE '%${firstname}%')`
                }
                if (!_.isEmpty(lastname)) {
                    queryCount += ` AND (PI.Lastname LIKE '%${lastname}%')`
                }
                if (!_.isEmpty(phone_no)) {
                    queryCount += ` AND PI.PhoneNo = '${phone_no}'`
                }
                if (!_.isEmpty(passport)) {
                    queryCount += ` AND PI.Passport = '${passport}'`
                }
                if (!_.isEmpty(national_id)) {
                    queryCount += ` AND PI.NationalID = '${national_id}'`
                }
                if (!_.isEmpty(dateOfBirth)) {
                    queryCount += ` AND (PI.DOB = '${dateOfBirth}')`
                }
                queryCount += ` AND Site IN ('${site}')`
                let count = await repos.query(queryCount)
                let data = await repos.query(query)
                await data.map((d : any) => {
                    let encrypted = CryptoJS.AES.encrypt(d.UID, 'C36bJmRax7');
                    return d.UID = encrypted.toString()
                })
                const result = {
                    pagination: {
                        currentPage: parseInt("1"),
                        totalPage: Math.ceil(count[0].count / 20),
                        totalResult: count[0].count
                    },
                    result: data
                }
                res.send(result)

            } catch (error) {
                res.status(404).json([])
            }
        }
    }
    getApprovedData() {
        return async (req : Request, res : Response) => {
            let {
                id,
                firstname,
                lastname,
                phone_no,
                passport,
                dateOfBirth,
                national_id,
                site,
                page
            } = req.body;
            let repos = di.get("repos");
            try {
                let startNum = (parseInt("1") * 15) - 15
                let LimitNum = 15

                let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Registration.Patient_Info PI`
                query += ` LEFT JOIN Registration.CT_Sex CTS ON CTS.Id = PI.Gender`
                query += ` WHERE Approve = 1`
                query += ` AND Confirm = 1`
                query += ` AND DownloadPDF != 1`
                if (!_.isEmpty(firstname)) {
                    query += ` AND (PI.Firstname LIKE '%${firstname}%')`
                }
                if (!_.isEmpty(lastname)) {
                    query += ` AND (PI.Lastname LIKE '%${lastname}%')`
                }
                if (!_.isEmpty(phone_no)) {
                    query += ` AND PI.PhoneNo = '${phone_no}'`
                }
                if (!_.isEmpty(passport)) {
                    query += ` AND PI.Passport = '${passport}'`
                }
                if (!_.isEmpty(national_id)) {
                    query += ` AND PI.NationalID = '${national_id}'`
                }
                if (!_.isEmpty(dateOfBirth)) {
                    query += ` AND (PI.DOB = '${dateOfBirth}')`
                }
                query += ` AND Site IN ('${site}')`
                query += ` ORDER BY ID DESC LIMIT ${startNum},${LimitNum}`

                let queryCount = `SELECT COUNT(PI.ID) as count FROM Registration.Patient_Info PI`
                queryCount += ` WHERE Approve = 1`
                queryCount += ` AND Confirm = 1`
                queryCount += ` AND DownloadPDF != 1`
                if (!_.isEmpty(firstname)) {
                    queryCount += ` AND (PI.Firstname LIKE '%${firstname}%')`
                }
                if (!_.isEmpty(lastname)) {
                    queryCount += ` AND (PI.Lastname LIKE '%${lastname}%')`
                }
                if (!_.isEmpty(phone_no)) {
                    queryCount += ` AND PI.PhoneNo = '${phone_no}'`
                }
                if (!_.isEmpty(passport)) {
                    queryCount += ` AND PI.Passport = '${passport}'`
                }
                if (!_.isEmpty(national_id)) {
                    queryCount += ` AND PI.NationalID = '${national_id}'`
                }
                if (!_.isEmpty(dateOfBirth)) {
                    queryCount += ` AND (PI.DOB = '${dateOfBirth}')`
                }
                queryCount += ` AND Site IN ('${site}')`
                let count = await repos.query(queryCount)
                let data = await repos.query(query)
                await data.map((d : any) => {
                    let encrypted = CryptoJS.AES.encrypt(d.UID, 'C36bJmRax7');
                    return d.UID = encrypted.toString()
                })
                const result = {
                    pagination: {
                        currentPage: parseInt("1"),
                        totalPage: Math.ceil(count[0].count / 20),
                        totalResult: count[0].count
                    },
                    result: data
                }
                res.send(result)

            } catch (error) {
                res.status(404).json([])
            }
        }
    }

    // addPrintJob() {
    // return async (req: Request,res: Response) => {
    //     let {buff} = req.body;


    //      var ipp = require('ipp');

    //       var data = Buffer.from(buff);
    //       console.log(data);
    //       var printer = ipp.Printer("http://10.104.101.24:631/printers");
    //       var msg = {
    //         "operation-attributes-tag": {
    //           "requesting-user-name": "Preregistraion-Print-Services",
    //           "job-name": "whatever.pdf",
    //           "document-format": "application/pdf"
    //         }

    //         , data: data
    //       };
    //       // printer.execute("Print-Job", msg, function(err: any, res: any){
    //       //   if (err)
    //       //   {
    //       //     console.log(err);
    //       //   }
    //       // });
    //     //});
    //     res.send({message: 'Success'})
    // }
    // }


    getSearch() {
        return async (req : Request, res : Response) => {
            let {
                id,
                firstname,
                lastname,
                phone_no,
                passport,
                dateOfBirth,
                national_id,
                site,
                page
            } = req.body;

            let repos = di.get("repos");
            try {
                let startNum = (parseInt(page) * 15) - 15
                let LimitNum = 15
                if (_.isEmpty(id) && !_.isNumber(id)) {
                    let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Registration.Patient_Info PI`
                    query += ` LEFT JOIN Registration.CT_Sex CTS ON CTS.Id = PI.Gender`
                    query += ` WHERE 1 = 1`
                    if (!_.isEmpty(firstname)) {
                        query += ` AND (PI.Firstname LIKE '%${firstname}%')`
                    }
                    if (!_.isEmpty(lastname)) {
                        query += ` AND (PI.Lastname LIKE '%${lastname}%')`
                    }
                    if (!_.isEmpty(phone_no)) {
                        query += ` AND PI.PhoneNo = '${phone_no}'`
                    }
                    if (!_.isEmpty(passport)) {
                        query += ` AND PI.Passport = '${passport}'`
                    }
                    if (!_.isEmpty(national_id)) {
                        query += ` AND PI.NationalID = '${national_id}'`
                    }
                    if (!_.isEmpty(dateOfBirth)) {
                        query += ` AND (PI.DOB = '${dateOfBirth}')`
                    }

                    query += ` AND Confirm != 1`
                    query += ` AND Site IN ('${site}')`
                    query += ` ORDER BY ID DESC LIMIT ${startNum},${LimitNum}`
                    let queryCount = `SELECT COUNT(PI.ID) as count FROM Registration.Patient_Info PI`
                    queryCount += ` WHERE 1 = 1`
                    if (!_.isEmpty(firstname)) {
                        queryCount += ` AND (PI.Firstname LIKE '%${firstname}%')`
                    }
                    if (!_.isEmpty(lastname)) {
                        queryCount += ` AND (PI.Lastname LIKE '%${lastname}%')`
                    }
                    if (!_.isEmpty(phone_no)) {
                        queryCount += ` AND PI.PhoneNo = '${phone_no}'`
                    }
                    if (!_.isEmpty(passport)) {
                        queryCount += ` AND PI.Passport = '${passport}'`
                    }
                    if (!_.isEmpty(national_id)) {
                        queryCount += ` AND PI.NationalID = '${national_id}'`
                    }

                    if (!_.isEmpty(dateOfBirth)) {
                        queryCount += ` AND (PI.DOB = '${dateOfBirth}')`
                    }

                    queryCount += ` AND Confirm != 1`
                    queryCount += ` AND Site IN ('${site}')`

                    let count = await repos.query(queryCount)
                    let data = await repos.query(query)
                    await data.map((d : any) => {
                        let encrypted = CryptoJS.AES.encrypt(d.UID, 'C36bJmRax7');
                        return d.UID = encrypted.toString()
                    })
                    await data.map((d : any) => {
                        d.Firstname  = d.Firstname != null ? d.Firstname : d.FirstnameEN
                        d.Lastname  = d.Lastname != null ? d.Lastname : d.LastnameEN
                    })
                    const result = {
                        pagination: {
                            currentPage: parseInt(page),
                            totalPage: Math.ceil(count[0].count / 20),
                            totalResult: count[0].count
                        },
                        result: data
                    }
                    res.send(result)
                } else {
                    let decrypted = await CryptoJS.AES.decrypt(id, "C36bJmRax7")
                    let uid = decrypted.toString(CryptoJS.enc.Utf8)
                    let data = await this.getPatientByIdFromDB(uid)
                    res.send(data)

                }
            } catch (error) {
                console.log(error);
                res.status(404).json([])
            }
        }
    }
    saveSignature() {
        return async (req : Request, res : Response) => {
            let {
                signatureHash,
                signatureImage,
                id,
                signType,
                consent,
                consentText
            } = req.body;
            let repos = di.get("repos");
            let query = `UPDATE Registration.Patient_Info SET Confirm=1 WHERE ID=${id};`
            let insertSignature = `INSERT INTO Registration.Signature (PatientID, HashSiganture, Signature, SignType) VALUES(${id}, '${signatureHash}', '${signatureImage}', '${signType}');`
            await repos.query(query)
            await repos.query(insertSignature)
            res.send({message: 'Success'})
        }
    }
    async updateAdult(body : any) {
        let repos = di.get("repos");
        let getComment = (type : string, data : any) => {
            if (type == 'alcohol') { // return `quantity: ${data.quantity}, duration: ${data.detail.duration}, beverages: ${data.detail.beverages}, comment: ${data.comment}`
                return `quantity: "Whisky 1 shot/Beer 1 can/Whisky 180 ml/day", duration: "1 Weeks", beverages: ${
                    data.detail.beverages
                }, comment: ${
                    data.comment
                }`
            } else if (type == 'exercise') {
                return `quantity: ${
                    data.quantity
                }, comment: ${
                    data.comment
                }`
            } else if (type == 'smoke') {
                return `quantity: ${
                    data.quantity
                }, duration: ${
                    data.detail.duration
                }, comment: ${
                    data.comment
                }`
            }
        }
        let dateDob = new Date(body.patient_info.dob)
        dateDob.setHours(dateDob.getHours() + 7);
        let dataInfo = {
            Title: body.patient_info.title,
            Firstname: body.patient_info.firstname,
            Middlename: body.patient_info.middlename,
            Lastname: body.patient_info.lastname,
            TitleEN: body.patient_info.titleEN,
            FirstnameEN: body.patient_info.firstnameEN,
            MiddlenameEN: body.patient_info.middlenameEN,
            LastnameEN: body.patient_info.lastnameEN,
            DOB: `${
                dateDob.getFullYear()
            }-${
                ("0" + (
                    dateDob.getMonth() + 1
                )).slice(-2)
            }-${
                ("0" + dateDob.getDate()).slice(-2)
            }`,
            Gender: body.patient_info.gender,
            Nationality: body.patient_info.nationality,
            Religion: body.patient_info.religion,
            PreferredLanguage: body.patient_info.preferredlanguage,
            Expatriate: body.patient_info.expatriate,
            MaritalStatus: body.patient_info.marital_status,
            NationalID: body.patient_info.national_id,
            Passport: body.patient_info.passport,
            Occupation: body.patient_info.occupation,
            PhoneNo: body.patient_info.phone_no,
            Email: body.patient_info.email,
            Homephone: body.patient_info.homephone,
            Officephone: body.patient_info.officephone,
            DefaultLanguage: body.defaultlanguage
        }
        let queryInfo = `UPDATE Registration.Patient_Info SET ? WHERE ID = '${
            body.ID
        }'`

        let dataPresent = {
            Country: body.present.country,
            Postcode: body.present.postcode,
            Subdistrict: body.present.subdistrict,
            District: body.present.districtid,
            Address: body.present.address,
            Province: body.present.provinceid,
            sameAddress: null
        }
        let queryPresent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${
            body.ID
        }' And Type = 0`

        let dataPermanent = {
            Country: body.permanent.sameAddress ? body.present.country : body.permanent.country,
            Postcode: body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
            Subdistrict: body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
            District: body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
            Address: body.permanent.sameAddress ? body.present.address : body.permanent.address,
            Province: body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
            sameAddress: body.permanent.sameAddress
        }
        let queryPermanent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${
            body.ID
        }' And Type = 1`

        let dataEmergency = {
            Firstname: body.emergency.first_name,
            Lastname: body.emergency.last_name,
            Relation: body.emergency.relation,
            Email: body.emergency.email,
            PhoneNo: body.emergency.phone_no,
            Country: body.emergency.sameAddress ? body.present.country : body.emergency.country,
            Postcode: body.emergency.sameAddress ? body.present.postcode : body.emergency.postcode,
            Subdistrict: body.emergency.sameAddress ? body.present.subdistrict : body.emergency.subdistrict,
            District: body.emergency.sameAddress ? body.present.districtid : body.emergency.districtid,
            Address: body.emergency.sameAddress ? body.present.address : body.emergency.address,
            Province: body.emergency.sameAddress ? body.present.provinceid : body.emergency.provinceid,
            sameAddress: body.emergency.sameAddress
        }
        let queryEmergency = `UPDATE Registration.Patient_Emergency SET ? WHERE PatientID = '${
            body.ID
        }'`

        let financialDob = new Date(body.financial.dob)
        financialDob.setHours(financialDob.getHours() + 7);
        let dataFinancial = {
            SelfPay: _.indexOf(body.financial.payment_method, 'Self pay') >= 0 ? 1 : 0,
            CompanyContact: _.indexOf(body.financial.payment_method, 'Company contract') >= 0 ? 1 : 0,
            Insurance: _.indexOf(body.financial.payment_method, 'Insurance') >= 0 ? 1 : 0,
            CompanyDesc: body.financial.company,
            InsuranceDesc: body.financial.insurance,
            PaymentAs: body.financial.payment_as,
            Title: body.financial.title,
            Firstname: body.financial.firstname,
            Lastname: body.financial.lastname,
            DOB: `${
                financialDob.getFullYear()
            }-${
                ("0" + (
                    financialDob.getMonth() + 1
                )).slice(-2)
            }-${
                ("0" + financialDob.getDate()).slice(-2)
            }`,
            Aforemention: body.financial.aforemention
        }
        let queryFinancial = `UPDATE Registration.Patient_Financial SET ? WHERE PatientID = '${
            body.ID
        }'`
        let dataHistory = {
            MaritalStatus: body.personal_history.marital_status,
            Children: body.personal_history.children,
            Diseases: JSON.stringify(body.personal_history.diseases),
            Medication: body.personal_history.medication,
            CommentMedication: body.personal_history.c_medication,
            Hospitalization: body.personal_history.hospitalization,
            CommentHospitalization: body.personal_history.c_hospitalization,
            Physical: body.personal_history.physical,
            CommentPhysical: body.personal_history.c_physical,
            Exercise: body.personal_history.exercise.status,
            Pregnant: body.personal_history.pregnant,
            CommentPregnant: body.personal_history.c_pregnant,
            Giver: body.personal_history.giver,
            CommentGiver: body.personal_history.c_giver,
            AbsenceFromWork: _.indexOf(body.personal_history.medical_certificate, 'absence') >= 0 ? 1 : 0,
            Reimbursement: _.indexOf(body.personal_history.medical_certificate, 'reimbursement') >= 0 ? 1 : 0,
            GovernmentReimbursement: _.indexOf(body.personal_history.doctor_certificate, 'government_reimbursement') >= 0 ? 1 : 0,
            StateEnterprise: _.indexOf(body.personal_history.doctor_certificate, 'state_enterprise') >= 0 ? 1 : 0,
            Authorize: body.personal_history.authorize,
            CommentAuthorize: body.personal_history.c_authorize,
            Spiritual: body.personal_history.spiritual,
            CommentSpiritual: body.personal_history.c_spiritual,
            Allergies: body.personal_history.allergies,
            CommentAllergies: body.personal_history.c_allergies,
            Alcohol: body.personal_history.alcohol.status,
            DrugAbuse: body.personal_history.drugabuse.status,
            Smoke: body.personal_history.smoke.status,
            FatherAlive: body.personal_history.father.alive,
            FatherAge: body.personal_history.father.age,
            CauseFather: body.personal_history.father.cause,
            MotherAlive: body.personal_history.mother.alive,
            MotherAge: body.personal_history.mother.age,
            CauseMother: body.personal_history.mother.cause
        }
        let queryHistory = `UPDATE Registration.Patient_History SET ? Where PatientID = '${
            body.ID
        }'`

        await repos.query(queryInfo, dataInfo);
        await repos.query(queryPermanent, dataPermanent)
        await repos.query(queryPresent, dataPresent)
        await repos.query(queryEmergency, dataEmergency)
        await repos.query(queryFinancial, dataFinancial);
        await repos.query(queryHistory, dataHistory);

        let deleteFamily = `DELETE FROM Registration.Family_History WHERE PatientID = '${
            body.ID
        }'`
        await repos.query(deleteFamily);
        if (body.personal_history.family.length > 0) {

            let valuesFamily: any[] = []
            body.personal_history.family.map((p : any) => {
                if (p.person != null && p.illness != null) {
                    let value = [body.ID, p.person, p.illness]
                    valuesFamily.push(value)
                }
            })
            let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
            if (valuesFamily.length) 
                await repos.query(insertFamily, [valuesFamily])
            
        }
        let deleteSocial = `DELETE FROM Registration.Patient_Social WHERE PatientID = '${
            body.ID
        }'`
        await repos.query(deleteSocial);
        if (body.personal_history.exercise.status != null) {
            let dataExercise = {
                PatientID: body.ID,
                Habit: 'exercise',
                Status: body.personal_history.exercise.status,
                Quantity: body.personal_history.exercise.quantity,
                Detail: null,
                Comment: body.personal_history.exercise.comment
            }
            let insertExercise = `INSERT INTO Registration.Patient_Social SET ?`
            await repos.query(insertExercise, dataExercise)
        }
        if (body.personal_history.alcohol.status != null) {
            let dataAlcohol = {
                PatientID: body.ID,
                Habit: 'alcohol',
                Status: body.personal_history.alcohol.status,
                Quantity: body.personal_history.alcohol.quantity,
                DurationQuantity: body.personal_history.alcohol.duration.quantity,
                DurationUnit: body.personal_history.alcohol.duration.unit,
                Detail: JSON.stringify(body.personal_history.alcohol.detail),
                Comment: body.personal_history.alcohol.comment
            }
            let insertAlcohol = `INSERT INTO Registration.Patient_Social SET ?`
            await repos.query(insertAlcohol, dataAlcohol)
        }
        if (body.personal_history.drugabuse.status != null) {
            let dataDrugabuse = {
                PatientID: body.ID,
                Habit: 'drugabuse',
                Status: body.personal_history.drugabuse.status,
                Quantity: body.personal_history.drugabuse.quantity,
                Detail: JSON.stringify(body.personal_history.drugabuse.detail),
                Comment: body.personal_history.drugabuse.comment
            }
            let insertDrugabuse = `INSERT INTO Registration.Patient_Social SET ?`
            await repos.query(insertDrugabuse, dataDrugabuse)
        }
        if (body.personal_history.smoke.status != null) {
            let dataSmoke = {
                PatientID: body.ID,
                Habit: 'smoke',
                Status: body.personal_history.smoke.status,
                Quantity: body.personal_history.smoke.quantity,
                DurationQuantity: body.personal_history.smoke.duration.quantity,
                DurationUnit: body.personal_history.smoke.duration.unit,
                Detail: JSON.stringify(body.personal_history.smoke.detail),
                Comment: body.personal_history.smoke.comment
            }
            let insertSmoke = `INSERT INTO Registration.Patient_Social SET ?`
            await repos.query(insertSmoke, dataSmoke)
        }
        this.handleConsent(body.consent_form, body.ID)

        return

    }
    async updateChild(body : any) {
        let repos = di.get("repos");
        let dateDob = new Date(body.general_info.dob)
        dateDob.setHours(dateDob.getHours() + 7);
        let dataInfo = {
            Title: body.general_info.title,
            Firstname: body.general_info.firstname,
            Middlename: body.general_info.middlename,
            Lastname: body.general_info.lastname,
            DOB: `${
                dateDob.getFullYear()
            }-${
                ("0" + (
                    dateDob.getMonth() + 1
                )).slice(-2)
            }-${
                ("0" + dateDob.getDate()).slice(-2)
            }`,
            Gender: body.general_info.gender,
            Nationality: body.general_info.nationality,
            PhoneNo: body.general_info.phone_no,
            Email: body.general_info.email,
            Type: body.type,
            Site: body.site,
            Religion: body.general_info.religion,
            PreferredLanguage: body.general_info.preferredlanguage,
            DefaultLanguage: body.defaultlanguage
        }
        let queryInfo = `UPDATE Registration.Patient_Info SET ? WHERE ID = '${
            body.ID
        }'`

        let dataPresent = {
            Country: body.present.country,
            Postcode: body.present.postcode,
            Subdistrict: body.present.subdistrict,
            District: body.present.districtid,
            Address: body.present.address,
            Province: body.present.provinceid,
            sameAddress: null
        }
        let queryPresent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${
            body.ID
        }' And Type = 0`

        let dataPermanent = {
            Country: body.permanent.sameAddress ? body.present.country : body.permanent.country,
            Postcode: body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
            Subdistrict: body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
            District: body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
            Address: body.permanent.sameAddress ? body.present.address : body.permanent.address,
            Province: body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
            sameAddress: body.permanent.sameAddress
        }
        let queryPermanent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${
            body.ID
        }' And Type = 1`
        let dataFinancial = {
            SelfPay: _.indexOf(body.parent_info.payment_method, 'Self pay') >= 0 ? 1 : 0,
            CompanyContact: _.indexOf(body.parent_info.payment_method, 'Company contract') >= 0 ? 1 : 0,
            Insurance: _.indexOf(body.parent_info.payment_method, 'Insurance') >= 0 ? 1 : 0,
            CompanyDesc: body.parent_info.company,
            InsuranceDesc: body.parent_info.insurance
        }
        let dataPediatric = {
            Pob: body.pediatric.pob,
            BloodGroup: body.pediatric.blood_group,
            Weight: body.pediatric.weight,
            Height: body.pediatric.length,
            head: body.pediatric.head,
            Delivery: body.pediatric.delivery,
            DeliveryScore1: body.pediatric.deliveryscore1,
            DeliveryScore2: body.pediatric.deliveryscore2,
            Tsh: body.pediatric.tsh,
            Pku: body.pediatric.pku,
            Hearing: body.pediatric.hearing,
            Problems: body.pediatric.problems,
            ProblemsComment: body.pediatric.c_problems,
            Delay: body.pediatric.delay,
            DelayComment: body.pediatric.c_delay,
            Drug: body.pediatric.drug,
            DrugComment: body.pediatric.c_drug,
            Food: body.pediatric.food,
            FoodComment: body.pediatric.c_food,
            Other: body.pediatric.other,
            Othercomment: body.pediatric.c_other,
            Illness: body.pediatric.illness,
            Curmed: body.pediatric.curmed,
            Hospitalization: body.pediatric.hospitalization,
            HospitalizationComment: body.pediatric.c_hospitalization,
            Siblings: body.siblings.siblings
        }
        let queryFinancial = `UPDATE Registration.Patient_Financial SET ? WHERE PatientID = '${
            body.ID
        }'`
        let queryPediatric = `UPDATE Registration.Pediatric SET ? WHERE PatientID = '${
            body.ID
        }'`

        await repos.query(queryInfo, dataInfo);
        await repos.query(queryPermanent, dataPermanent)
        await repos.query(queryPresent, dataPresent)
        await repos.query(queryFinancial, dataFinancial);
        await repos.query(queryPediatric, dataPediatric);
        let valuesParent: any[] = []
        await body.parent_info.parent.map((d : any) => {
            let parentdata = [
                body.ID,
                d.title,
                d.firstname,
                d.middlename,
                d.lastname,
                d.relation,
                d.phoneno,
                d.email,
                d.contactemergency,
                d.livewithperson,
                d.sameAddress ? body.present.country : d.country,
                d.sameAddress ? body.present.postcode : d.postcode,
                d.sameAddress ? body.present.subdistrict : d.subdistrict,
                d.sameAddress ? body.present.districtid : d.districtid,
                d.sameAddress ? body.present.address : d.address,
                d.sameAddress ? body.present.provinceid : d.provinceid,
                d.sameAddress
            ]
            valuesParent.push(parentdata)
        })
        let deleteParent = `DELETE FROM Registration.Parent WHERE PatientID = '${
            body.ID
        }'`
        await repos.query(deleteParent);
        let queryParent = `INSERT INTO Registration.Parent (PatientID, Title, Firstname, Middlename, Lastname, Relation, PhoneNo, Email, ContactEmergency, LivePerson, Country, Postcode, Subdistrict, District, Address, Province, sameAddress) VALUES ?`
        await repos.query(queryParent, [valuesParent]);

        let deleteFamily = `DELETE FROM Registration.Family_History WHERE PatientID = '${
            body.ID
        }'`
        await repos.query(deleteFamily);

        if (body.siblings.family.length > 0) {

            let valuesFamily: any[] = []
            body.siblings.family.map((p : any) => {
                if (p.person != null && p.illness != null) {
                    let value = [body.ID, p.person, p.illness]
                    valuesFamily.push(value)
                }
            })
            let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
            if (valuesFamily.length) 
                await repos.query(insertFamily, [valuesFamily])
            
        }
        this.handleConsent(body.consent_form, body.ID)

        return
    }
    async approveAdult(body : any) {
        let repos = di.get("repos");
        let getComment = (type : string, data : any) => {
            if (type == 'alcohol') {
                return `quantity: ${
                    data.quantity
                }, duration: ${
                    data.duration
                }, beverages: ${
                    data.detail.beverages
                }, comment: ${
                    data.comment
                }`
            } else if (type == 'exercise') {
                return `quantity: ${
                    data.quantity
                }, comment: ${
                    data.comment
                }`
            } else if (type == 'smoke') {
                return `quantity: ${
                    data.quantity
                }, duration: ${
                    data.detail.duration
                }, comment: ${
                    data.comment
                }`
            }
        }
        let dateDob = new Date(body.patient_info.dob)
        dateDob.setHours(dateDob.getHours() + 7);
        let dataInfo = {
            Title: body.patient_info.title,
            Firstname: body.patient_info.firstname,
            Middlename: body.patient_info.middlename,
            Lastname: body.patient_info.lastname,
            TitleEN: body.patient_info.titleEN,
            FirstnameEN: body.patient_info.firstnameEN,
            MiddlenameEN: body.patient_info.middlenameEN,
            LastnameEN: body.patient_info.lastnameEN,
            DOB: `${
                dateDob.getFullYear()
            }-${
                ("0" + (
                    dateDob.getMonth() + 1
                )).slice(-2)
            }-${
                ("0" + dateDob.getDate()).slice(-2)
            }`,
            Gender: body.patient_info.gender,
            Nationality: body.patient_info.nationality,
            Religion: body.patient_info.religion,
            PreferredLanguage: body.patient_info.preferredlanguage,
            Expatriate: body.patient_info.expatriate,
            MaritalStatus: body.patient_info.marital_status,
            NationalID: body.patient_info.national_id,
            Passport: body.patient_info.passport,
            Occupation: body.patient_info.occupation,
            PhoneNo: body.patient_info.phone_no,
            Email: body.patient_info.email,
            Homephone: body.patient_info.homephone,
            Officephone: body.patient_info.officephone,
            DefaultLanguage: body.defaultlanguage
        }
        let queryInfo = `UPDATE Registration.Patient_Info SET ? WHERE ID = '${
            body.ID
        }'`

        let dataPresent = {
            Country: body.present.country,
            Postcode: body.present.postcode,
            Subdistrict: body.present.subdistrict,
            District: body.present.districtid,
            Address: body.present.address,
            Province: body.present.provinceid,
            sameAddress: null
        }
        let queryPresent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${
            body.ID
        }' And Type = 0`

        let dataPermanent = {
            Country: body.permanent.sameAddress ? body.present.country : body.permanent.country,
            Postcode: body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
            Subdistrict: body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
            District: body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
            Address: body.permanent.sameAddress ? body.present.address : body.permanent.address,
            Province: body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
            sameAddress: body.permanent.sameAddress
        }
        let queryPermanent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${
            body.ID
        }' And Type = 1`
        let dataEmergency = {
            Firstname: body.emergency.first_name,
            Lastname: body.emergency.last_name,
            Relation: body.emergency.relation,
            Email: body.emergency.email,
            PhoneNo: body.emergency.phone_no,
            Country: body.emergency.sameAddress ? body.present.country : body.emergency.country,
            Postcode: body.emergency.sameAddress ? body.present.postcode : body.emergency.postcode,
            Subdistrict: body.emergency.sameAddress ? body.present.subdistrict : body.emergency.subdistrict,
            District: body.emergency.sameAddress ? body.present.districtid : body.emergency.districtid,
            Address: body.emergency.sameAddress ? body.present.address : body.emergency.address,
            Province: body.emergency.sameAddress ? body.present.provinceid : body.emergency.provinceid,
            sameAddress: body.emergency.sameAddress
        }
        let queryEmergency = `UPDATE Registration.Patient_Emergency SET ? WHERE PatientID = '${
            body.ID
        }'`

        let financialDob = new Date(body.financial.dob)
        financialDob.setHours(financialDob.getHours() + 7);
        let dataFinancial = {
            SelfPay: _.indexOf(body.financial.payment_method, 'Self pay') >= 0 ? 1 : 0,
            CompanyContact: _.indexOf(body.financial.payment_method, 'Company contract') >= 0 ? 1 : 0,
            Insurance: _.indexOf(body.financial.payment_method, 'Insurance') >= 0 ? 1 : 0,
            CompanyDesc: body.financial.company,
            InsuranceDesc: body.financial.insurance,
            PaymentAs: body.financial.payment_as,
            Title: body.financial.title,
            Firstname: body.financial.firstname,
            Lastname: body.financial.lastname,
            DOB: `${
                financialDob.getFullYear()
            }-${
                ("0" + (
                    financialDob.getMonth() + 1
                )).slice(-2)
            }-${
                ("0" + financialDob.getDate()).slice(-2)
            }`,
            Aforemention: body.financial.aforemention
        }
        let queryFinancial = `UPDATE Registration.Patient_Financial SET ? WHERE PatientID = '${
            body.ID
        }'`
        let dataHistory = {
            MaritalStatus: body.personal_history.marital_status,
            Children: body.personal_history.children,
            Diseases: JSON.stringify(body.personal_history.diseases),
            Medication: body.personal_history.medication,
            CommentMedication: body.personal_history.c_medication,
            Hospitalization: body.personal_history.hospitalization,
            CommentHospitalization: body.personal_history.c_hospitalization,
            Physical: body.personal_history.physical,
            CommentPhysical: body.personal_history.c_physical,
            Exercise: body.personal_history.exercise.status,
            Pregnant: body.personal_history.pregnant,
            CommentPregnant: body.personal_history.c_pregnant,
            Giver: body.personal_history.giver,
            CommentGiver: body.personal_history.c_giver,
            AbsenceFromWork: _.indexOf(body.personal_history.medical_certificate, 'absence') >= 0 ? 1 : 0,
            Reimbursement: _.indexOf(body.personal_history.medical_certificate, 'reimbursement') >= 0 ? 1 : 0,
            GovernmentReimbursement: _.indexOf(body.personal_history.doctor_certificate, 'government_reimbursement') >= 0 ? 1 : 0,
            StateEnterprise: _.indexOf(body.personal_history.doctor_certificate, 'state_enterprise') >= 0 ? 1 : 0,
            Authorize: body.personal_history.authorize,
            CommentAuthorize: body.personal_history.c_authorize,
            Spiritual: body.personal_history.spiritual,
            CommentSpiritual: body.personal_history.c_spiritual,
            Allergies: body.personal_history.allergies,
            CommentAllergies: body.personal_history.c_allergies,
            Alcohol: body.personal_history.alcohol.status,
            DrugAbuse: body.personal_history.drugabuse.status,
            Smoke: body.personal_history.smoke.status,
            FatherAlive: body.personal_history.father.alive,
            FatherAge: body.personal_history.father.age,
            CauseFather: body.personal_history.father.cause,
            MotherAlive: body.personal_history.mother.alive,
            MotherAge: body.personal_history.mother.age,
            CauseMother: body.personal_history.mother.cause
        }
        let queryHistory = `UPDATE Registration.Patient_History SET ? Where PatientID = '${
            body.ID
        }'`

        let insertinfo = await repos.query(queryInfo, dataInfo);
        await repos.query(queryPermanent, dataPermanent)
        await repos.query(queryPresent, dataPresent)
        await repos.query(queryEmergency, dataEmergency)
        await repos.query(queryFinancial, dataFinancial);
        await repos.query(queryHistory, dataHistory);

        if (body.personal_history.family.length > 0) {
            let deleteFamily = `DELETE FROM Registration.Family_History WHERE PatientID = '${
                body.ID
            }'`
            await repos.query(deleteFamily);
            let valuesFamily: any[] = []
            body.personal_history.family.map((p : any) => {
                if (p.person != null && p.illness != null) {
                    let value = [body.ID, p.person, p.illness]
                    valuesFamily.push(value)
                }
            })
            let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
            if (valuesFamily.length) 
                await repos.query(insertFamily, [valuesFamily])
            
        }
        let deleteSocial = `DELETE FROM Registration.Patient_Social WHERE PatientID = '${
            body.ID
        }'`
        await repos.query(deleteSocial);
        if (body.personal_history.exercise.status != null) {
            let dataExercise = {
                PatientID: body.ID,
                Habit: 'exercise',
                Status: body.personal_history.exercise.status,
                Quantity: body.personal_history.exercise.quantity,
                Detail: null,
                Comment: body.personal_history.exercise.comment
            }
            let insertExercise = `INSERT INTO Registration.Patient_Social SET ?`
            await repos.query(insertExercise, dataExercise)
        }
        if (body.personal_history.alcohol.status != null) {
            let dataAlcohol = {
                PatientID: body.ID,
                Habit: 'alcohol',
                Status: body.personal_history.alcohol.status,
                Quantity: body.personal_history.alcohol.quantity,
                DurationQuantity: body.personal_history.alcohol.duration.quantity,
                DurationUnit: body.personal_history.alcohol.duration.unit,
                Detail: JSON.stringify(body.personal_history.alcohol.detail),
                Comment: body.personal_history.alcohol.comment
            }
            let insertAlcohol = `INSERT INTO Registration.Patient_Social SET ?`
            await repos.query(insertAlcohol, dataAlcohol)
        }
        if (body.personal_history.drugabuse.status != null) {
            let dataDrugabuse = {
                PatientID: body.ID,
                Habit: 'drugabuse',
                Status: body.personal_history.drugabuse.status,
                Quantity: null,
                DurationQuantity: null,
                DurationUnit: null,
                Detail: JSON.stringify(body.personal_history.drugabuse.detail),
                Comment: body.personal_history.drugabuse.comment
            }
            let insertDrugabuse = `INSERT INTO Registration.Patient_Social SET ?`
            await repos.query(insertDrugabuse, dataDrugabuse)
        }
        if (body.personal_history.smoke.status != null) {
            let dataSmoke = {
                PatientID: body.ID,
                Habit: 'smoke',
                Status: body.personal_history.smoke.status,
                Quantity: body.personal_history.smoke.quantity,
                DurationQuantity: body.personal_history.smoke.duration.quantity,
                DurationUnit: body.personal_history.smoke.duration.unit,
                Detail: JSON.stringify(body.personal_history.smoke.detail),
                Comment: body.personal_history.smoke.comment
            }
            let insertSmoke = `INSERT INTO Registration.Patient_Social SET ?`
            await repos.query(insertSmoke, dataSmoke)
        }
        this.handleConsent(body.consent_form, body.ID)
        let queryNation = `SELECT * FROM Registration.CT_Nation Where ID = ${
            body.patient_info.nationality
        }`
        let queryReligion = `SELECT * FROM Registration.CT_Religion Where ID = ${
            body.patient_info.religion
        }`
        let queryGender = `SELECT * FROM Registration.CT_Sex Where ID = ${
            body.patient_info.gender
        }`

        let Country = async (id : any) => {
            let queryCountry = `SELECT * FROM Registration.CT_Country Where ID = ${id}`
            let country = await repos.query(queryCountry)
            if (! country.length) 
                return null
            
            return country[0].Desc_EN
        }

        let Subdistrict = async (id : any) => {
            let querySubdistrict = `SELECT * FROM Registration.CT_CityArea_1 WHERE ID = ${id}`
            let subdistrict = await repos.query(querySubdistrict)
            if (! subdistrict.length) 
                return null
            
            return subdistrict[0].Desc_TC
        }
        let District = async (id : any) => {
            let queryDistrict = `SELECT * FROM Registration.CT_City_1 WHERE ID = ${id}`
            let district = await repos.query(queryDistrict)
            if (! district.length) 
                return ''
            
            return district[0].Desc_TC
        }
        let Province = async (id : any) => {
            let queryProvince = `SELECT * FROM Registration.CT_Province_1 WHERE ID = ${id}`
            let provice = await repos.query(queryProvince)
            if (! provice.length) 
                return ''
            
            return provice[0].Desc_TH
        }
        let PreferredLanguage = async (id : any) => {
            let querySubdistrict = `SELECT Desc_EN FROM Registration.CT_PreferredLanguage WHERE ID = ${id}`
            let subdistrict = await repos.query(querySubdistrict)
            if (! subdistrict.length) 
                return null
            
            return subdistrict[0].Desc_EN
        }
        let Title = async (id : any) => {
            let queryTitle = `SELECT * FROM Registration.CT_Title Where ID = ${id}`
            let title = await repos.query(queryTitle)
            if (! title.length) 
                return null
            
            return title[0].Desc
        }
        let Relation = async (id : any) => {
            let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${id}`
            let relation = await repos.query(queryRelation)
            if (! relation.length) 
                return null
            
            return relation[0].Code
        }
        let FamilyRelation = async (id : any) => {
            let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${id}`
            let relation = await repos.query(queryRelation)
            if (! relation.length) 
                return null
            
            return relation[0].Desc
        }
        let FamilyDisease = async (id : any) => {
            let queryRelation = `SELECT * FROM Registration.CT_Diseases Where ID = ${id}`
            let disease = await repos.query(queryRelation)
            if (! disease.length) 
                return null
            
            return body.defaultlanguage == 'th' ? disease[0].DescTH : disease[0].DescEN
        }
        let Nation = await repos.query(queryNation)
        let Religion = await repos.query(queryReligion)
        let Gender = await repos.query(queryGender)

        let family = await Promise.all(body.personal_history.family.map(async (item : any) : Promise < any > => {

            // let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${item.person}`
            // let relation = await repos.query(queryRelation)
            return {
                // "id_patient_family": null,
                // "id_patient_information": null,
                "patient_id": body.ID,
                "relation": await FamilyRelation(item.person),
                // "disease": null,
                // "start": 0,
                // "end": 0,
                "comment": await FamilyDisease(item.illness)
            }
        }));
        let social: any = new Array()
        let dataalcohol = await {
            // id_patient_social: null,
            // id_patient_information: null,
            patient_id : body.ID,
            habit : "Alcohol",
            quantity : body.personal_history.alcohol.status ? body.personal_history.alcohol.quantity : "None",
            duration : body.personal_history.alcohol.duration.quantity ? body.personal_history.alcohol.duration.quantity + "-" + body.personal_history.alcohol.duration.unit : null,
            // detail: null,
            comment : body.personal_history.alcohol.comment
            // comment: await getComment('alcohol', body.personal_history.alcohol)
        }
        let dataexercise = await {
            // id_patient_social: null,
            // id_patient_information: null,
            patient_id : body.ID,
            habit : "Exercise",
            quantity : body.personal_history.exercise.status ? body.personal_history.exercise.quantity : "None",
            duration : null,
            // detail: null,
            comment : body.personal_history.exercise.comment
            // comment: await getComment('exercise', body.personal_history.exercise)
        }
        let datasmoke = await {
            // id_patient_social: null,
            // id_patient_information: null,
            patient_id : body.ID,
            habit : "Smoking",
            quantity : body.personal_history.smoke.status ? body.personal_history.smoke.quantity : "None",
            duration : body.personal_history.smoke.duration.quantity ? body.personal_history.smoke.duration.quantity + "-" + body.personal_history.smoke.duration.unit : null,
            // detail: null,
            comment : body.personal_history.smoke.comment
            // quality: null,
            // detail: null,
            // comment: await getComment('smoke', body.personal_history.smoke)
        }

        let datadrugabuse = await {
            // id_patient_social: null,
            // id_patient_information: null,
            patient_id : body.ID,
            habit : "Drug abuse",
            quantity : body.personal_history.drugabuse.status ? "Current" : "None",
            duration : null,
            // detail: null,
            comment : body.personal_history.drugabuse.comment
            // quality: null,
            // detail: null,
            // comment: await getComment('smoke', body.personal_history.smoke)
        }

        await social.push(dataalcohol)
        await social.push(dataexercise)
        await social.push(datasmoke)
        await social.push(datadrugabuse)
        // if (body.personal_history.alcohol.status) await social.push(dataalcohol)
        // if (body.personal_history.exercise.status) await social.push(dataexercise)
        // if (body.personal_history.smoke.status) await social.push(datasmoke)
        let checkstatus = (d : any) => {
            if (d == 'Single') 
                return 1
            
            if (d == 'Married') 
                return 2
            
            if (d == 'Divorced') 
                return 3
            
            if (d == 'Widowed') 
                return 4
            
            if (d == 'Priest') 
                return 5
            
            if (d == 'Separated') 
                return 6
            
            if (d == 'Unknown') 
                return 7
            
        }
        let rpadata = {

            "server": rpaSetting.SERVER,
            "server_type": rpaSetting.SERVER_TYPE,
            "id_patient_information": 126,
            "patient_code": "9xkevj",
            "id": body.ID,
            "hn": null,
            "title_th": await Title(body.patient_info.title),
            "firstname_th": body.patient_info.firstname.toUpperCase(),
            "middlename_th": body.patient_info.middlename,
            "lastname_th": body.patient_info.lastname.toUpperCase(),
            "title_en": null,
            "firstname_en": null,
            "middlename_en": null,
            "lastname_en": null,
            "nationality": Nation[0].Desc_EN,
            "religion": body.patient_info.religion,
            "religion_desc": Religion[0].Desc_TH,
            "religion_desc_en": Religion[0].Desc_EN,
            "national_id": body.patient_info.national_id,
            "passport_id": body.patient_info.passport,
            "dob": dateDob,
            "age": null,
            "gender": body.patient_info.gender,
            "gender_desc_en": Gender[0].Desc_EN,
            "gender_desc_th": Gender[0].Desc_TH,
            "marital_status": await checkstatus(body.patient_info.marital_status),
            "preferrend_language": await PreferredLanguage(body.patient_info.preferredlanguage),
            "occupation": body.patient_info.occupation,
            "mobile_phone": (body.patient_info.phone_no && body.patient_info.phone_no.length == 10) ? body.patient_info.phone_no : ".",
            "email": body.patient_info.email,
            "home_telephone": body.patient_info.phone_no,
            "office_telephone": body.patient_info.officephone,
            "permanent_address": body.present.address,
            "permanent_sub_district": await Subdistrict(body.present.subdistrict),
            "permanent_district": await District(body.present.districtid),
            "permanent_province": await Province(body.present.provinceid),
            "permanent_postcode": body.present.postcode,
            "permanent_country": await Country(body.present.country),
            "same_permanent": body.permanent.sameAddress ? 1 : 0,
            "present_address": body.permanent.sameAddress ? body.present.address : body.permanent.address,
            "present_sub_district": body.permanent.sameAddress ? await Subdistrict(body.present.subdistrict) : await Subdistrict(body.permanent.subdistrict),
            "present_district": body.permanent.sameAddress ? await District(body.present.districtid) : await District(body.permanent.districtid),
            "present_province": body.permanent.sameAddress ? await Province(body.present.provinceid) : await Province(body.permanent.provinceid),
            "present_postcode": body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
            "present_country": body.permanent.sameAddress ? await Country(body.present.country) : await Country(body.permanent.country),
            "ec_firstname": body.emergency.first_name.toUpperCase(),
            "ec_lastname": body.emergency.last_name.toUpperCase(),
            "ec_relationship": await Relation(body.emergency.relation),
            "ec_relationship_other": body.emergency.relation,
            "ec_telephone": body.emergency.phone_no,
            "e_home_telephone": body.emergency.phone_no,
            "ec_email": body.emergency.email,
            "ec_address_same_patient": body.emergency.sameAddress ? 1 : 0,
            "ec_address": body.emergency.sameAddress ? body.present.address : body.emergency.address,
            "ec_sub_district": body.emergency.sameAddress ? await Subdistrict(body.present.subdistrict) : await Subdistrict(body.emergency.subdistrict),
            "ec_district": body.emergency.sameAddress ? await District(body.present.districtid) : await District(body.emergency.districtid),
            "ec_province": body.emergency.sameAddress ? await Province(body.present.provinceid) : await Province(body.emergency.provinceid),
            "ec_postcode": body.emergency.sameAddress ? body.present.postcode : body.emergency.postcode,
            "ec_country": body.emergency.sameAddress ? await Country(body.present.country) : await Country(body.emergency.country),
            "date_created": null,
            "date_updated": null,
            "site": body.site,
            "location": body.location.CTLOC_Desc,
            "Truama": "No",
            "ARI": "No",
            "location_register": "1-Medical Record Department",
            "access_profile": "Registration Staff"


        }

        let aa_register = di.get("rpa");

        let queryaainfo = `INSERT INTO aa_register.patient_data SET ?`
        let deleteaainfo = `DELETE FROM aa_register.patient_data WHERE id = '${
          body.ID
      }'`
      aa_register.query(deleteaainfo).then(() => {
        let queryaainfo = `INSERT INTO aa_register.patient_data SET ?`
              aa_register.query(queryaainfo, rpadata)
      })


        let deleteaasocial = `DELETE FROM aa_register.social_list WHERE patient_id = '${
            body.ID
        }'`
        aa_register.query(deleteaasocial).then(() => {
            let queryaasocial = `INSERT INTO aa_register.social_list SET ?`
            aa_register.query(queryaasocial, dataalcohol)
            aa_register.query(queryaasocial, dataexercise)
            aa_register.query(queryaasocial, datasmoke)
            aa_register.query(queryaasocial, datadrugabuse)
        })

        let deleteaafamily = `DELETE FROM aa_register.family_list WHERE patient_id = '${
            body.ID
        }'`
        aa_register.query(deleteaafamily).then(() => {
            let queryaafamily = `INSERT INTO aa_register.family_list SET ?`


            family.map(async (d) => {
                await aa_register.query(queryaafamily, d)
            })

        })


        let rpa = {
            "data": {
                "server": rpaSetting.SERVER,
                "server_type": rpaSetting.SERVER_TYPE,
                "id_patient_information": 126,
                "patient_code": "9xkevj",
                "hn": null,
                "title_th": await Title(body.patient_info.title),
                "firstname_th": body.patient_info.firstname.toUpperCase(),
                "middlename_th": body.patient_info.middlename,
                "lastname_th": body.patient_info.lastname.toUpperCase(),
                "title_en": null,
                "firstname_en": null,
                "middlename_en": null,
                "lastname_en": null,
                "nationality": Nation[0].Desc_EN,
                "religion": body.patient_info.religion,
                "religion_desc": Religion[0].Desc_TH,
                "religion_desc_en": Religion[0].Desc_EN,
                "national_id": body.patient_info.national_id,
                "passport_id": body.patient_info.passport,
                "dob": dateDob,
                "age": null,
                "gender": body.patient_info.gender,
                "gender_desc_en": Gender[0].Desc_EN,
                "gender_desc_th": Gender[0].Desc_TH,
                "marital_status": await checkstatus(body.patient_info.marital_status),
                "preferrend_language": await PreferredLanguage(body.patient_info.preferredlanguage),
                "occupation": body.patient_info.occupation,
                "mobile_phone": (body.patient_info.phone_no && body.patient_info.phone_no.length == 10) ? body.patient_info.phone_no : ".",
                "email": body.patient_info.email,
                "home_telephone": body.patient_info.phone_no,
                "office_telephone": body.patient_info.officephone,
                "permanent_address": body.present.address,
                "permanent_sub_district": await Subdistrict(body.present.subdistrict),
                "permanent_district": await District(body.present.districtid),
                "permanent_province": await Province(body.present.provinceid),
                "permanent_postcode": body.present.postcode,
                "permanent_country": await Country(body.present.country),
                "same_permanent": body.permanent.sameAddress ? 1 : 0,
                "present_address": body.permanent.sameAddress ? body.present.address : body.permanent.address,
                "present_sub_district": body.permanent.sameAddress ? await Subdistrict(body.present.subdistrict) : await Subdistrict(body.permanent.subdistrict),
                "present_district": body.permanent.sameAddress ? await District(body.present.districtid) : await District(body.permanent.districtid),
                "present_province": body.permanent.sameAddress ? await Province(body.present.provinceid) : await Province(body.permanent.provinceid),
                "present_postcode": body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
                "present_country": body.permanent.sameAddress ? await Country(body.present.country) : await Country(body.permanent.country),
                "ec_firstname": body.emergency.first_name.toUpperCase(),
                "ec_lastname": body.emergency.last_name.toUpperCase(),
                "ec_relationship": await Relation(body.emergency.relation),
                "ec_relationship_other": body.emergency.relation,
                "ec_telephone": body.emergency.phone_no,
                "e_home_telephone": body.emergency.phone_no,
                "ec_email": body.emergency.email,
                "ec_address_same_patient": body.emergency.sameAddress ? 1 : 0,
                "ec_address": body.emergency.sameAddress ? body.present.address : body.emergency.address,
                "ec_sub_district": body.emergency.sameAddress ? await Subdistrict(body.present.subdistrict) : await Subdistrict(body.emergency.subdistrict),
                "ec_district": body.emergency.sameAddress ? await District(body.present.districtid) : await District(body.emergency.districtid),
                "ec_province": body.emergency.sameAddress ? await Province(body.present.provinceid) : await Province(body.emergency.provinceid),
                "ec_postcode": body.emergency.sameAddress ? body.present.postcode : body.emergency.postcode,
                "ec_country": body.emergency.sameAddress ? await Country(body.present.country) : await Country(body.emergency.country),
                "fi_payment_method": null,
                "fi_company": null,
                "date_created": null,
                "date_updated": null,
                "social_list": JSON.parse(JSON.stringify(social)),
                "family_list": JSON.parse(JSON.stringify(family)),
                "site": body.site,
                "location": body.location.CTLOC_Desc,
                "Truama": "No",
                "ARI": "No",
                "location_register": "1-Medical Record Department",
                "access_profile": "Registration Staff"

            }
        }
        let time = new Date();
        const filename = `RPA_Register_Adult_${
            time.getFullYear()
        }-${
            ("0" + (
                time.getMonth() + 1
            )).slice(-2)
        }-${
            time.getDate()
        }_${
            time.getTime()
        }.txt`
        const path = '/Process'
        await axios.post(`http://10.105.10.50:8700/api/CpoeRegister/registerCpoe`, {path, filename, data: rpa})
        return

    }
    async approveChild(body : any) {
        let repos = di.get("repos");
        let dateDob = new Date(body.general_info.dob)
        dateDob.setHours(dateDob.getHours() + 7);
        let dataInfo = {
            Title: body.general_info.title,
            Firstname: body.general_info.firstname.toUpperCase(),
            Middlename: body.general_info.middlename,
            Lastname: body.general_info.lastname.toUpperCase(),
            DOB: `${
                dateDob.getFullYear()
            }-${
                ("0" + (
                    dateDob.getMonth() + 1
                )).slice(-2)
            }-${
                ("0" + dateDob.getDate()).slice(-2)
            }`,
            Gender: body.general_info.gender,
            Nationality: body.general_info.nationality,
            PhoneNo: body.general_info.phone_no,
            Email: body.general_info.email,
            Type: body.type,
            Site: body.site,
            PreferredLanguage: body.general_info.preferredlanguage,
            DefaultLanguage: body.defaultlanguage
        }
        let queryInfo = `UPDATE Registration.Patient_Info SET ? WHERE ID = '${
            body.ID
        }'`

        let dataPresent = {
            Country: body.present.country,
            Postcode: body.present.postcode,
            Subdistrict: body.present.subdistrict,
            District: body.present.districtid,
            Address: body.present.address,
            Province: body.present.provinceid,
            sameAddress: null
        }
        let queryPresent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${
            body.ID
        }' And Type = 0`

        let dataPermanent = {
            Country: body.permanent.sameAddress ? body.present.country : body.permanent.country,
            Postcode: body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
            Subdistrict: body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
            District: body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
            Address: body.permanent.sameAddress ? body.present.address : body.permanent.address,
            Province: body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
            sameAddress: body.permanent.sameAddress
        }
        let queryPermanent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${
            body.ID
        }' And Type = 1`
        let dataFinancial = {
            SelfPay: _.indexOf(body.parent_info.payment_method, 'Self pay') >= 0 ? 1 : 0,
            CompanyContact: _.indexOf(body.parent_info.payment_method, 'Company contract') >= 0 ? 1 : 0,
            Insurance: _.indexOf(body.parent_info.payment_method, 'Insurance') >= 0 ? 1 : 0,
            CompanyDesc: body.parent_info.company,
            InsuranceDesc: body.parent_info.insurance
        }
        let dataPediatric = {
            Pob: body.pediatric.pob,
            BloodGroup: body.pediatric.blood_group,
            Weight: body.pediatric.weight,
            Height: body.pediatric.length,
            head: body.pediatric.head,
            Delivery: body.pediatric.delivery,
            DeliveryScore1: body.pediatric.deliveryscore1,
            DeliveryScore2: body.pediatric.deliveryscore2,
            Tsh: body.pediatric.tsh,
            Pku: body.pediatric.pku,
            Hearing: body.pediatric.hearing,
            Problems: body.pediatric.problems,
            ProblemsComment: body.pediatric.c_problems,
            Delay: body.pediatric.delay,
            DelayComment: body.pediatric.c_delay,
            Drug: body.pediatric.drug,
            DrugComment: body.pediatric.c_drug,
            Food: body.pediatric.food,
            FoodComment: body.pediatric.c_food,
            Other: body.pediatric.other,
            Othercomment: body.pediatric.c_other,
            Illness: body.pediatric.illness,
            Curmed: body.pediatric.curmed,
            Hospitalization: body.pediatric.hospitalization,
            HospitalizationComment: body.pediatric.c_hospitalization,
            Siblings: body.siblings.siblings
        }
        let queryFinancial = `UPDATE Registration.Patient_Financial SET ? WHERE PatientID = '${
            body.ID
        }'`
        let queryPediatric = `UPDATE Registration.Pediatric SET ? WHERE PatientID = '${
            body.ID
        }'`

        await repos.query(queryInfo, dataInfo);
        await repos.query(queryPermanent, dataPermanent)
        await repos.query(queryPresent, dataPresent)
        await repos.query(queryFinancial, dataFinancial);
        await repos.query(queryPediatric, dataPediatric);
        let valuesParent: any[] = []
        await body.parent_info.parent.map((d : any) => {
            let parentdata = [
                body.ID,
                d.title,
                d.firstname.toUpperCase(),
                d.middlename,
                d.lastname.toUpperCase(),
                d.relation,
                d.phoneno,
                d.email,
                d.contactemergency,
                d.livewithperson,
                d.sameAddress ? body.present.country : d.country,
                d.sameAddress ? body.present.postcode : d.postcode,
                d.sameAddress ? body.present.subdistrict : d.subdistrict,
                d.sameAddress ? body.present.districtid : d.districtid,
                d.sameAddress ? body.present.address : d.address,
                d.sameAddress ? body.present.provinceid : d.provinceid,
                d.sameAddress
            ]
            valuesParent.push(parentdata)
        })
        let deleteParent = `DELETE FROM Registration.Parent WHERE PatientID = '${
            body.ID
        }'`
        await repos.query(deleteParent);
        let queryParent = `INSERT INTO Registration.Parent (PatientID, Title, Firstname, Middlename, Lastname, Relation, PhoneNo, Email, ContactEmergency, LivePerson, Country, Postcode, Subdistrict, District, Address, Province, sameAddress) VALUES ?`
        await repos.query(queryParent, [valuesParent]);
        if (body.siblings.family.length > 0) {
            let deleteFamily = `DELETE FROM Registration.Family_History WHERE PatientID = '${
                body.ID
            }'`
            await repos.query(deleteFamily);
            let valuesFamily: any[] = []
            body.siblings.family.map((p : any) => {
                if (p.person != null && p.illness != null) {
                    let value = [body.ID, p.person, p.illness]
                    valuesFamily.push(value)
                }
            })
            let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
            if (valuesFamily.length) 
                await repos.query(insertFamily, [valuesFamily])
            
        }
        this.handleConsent(body.consent_form, body.ID)
        let queryNation = `SELECT * FROM Registration.CT_Nation Where ID = ${
            body.general_info.nationality
        }`
        let queryGender = `SELECT * FROM Registration.CT_Sex Where ID = ${
            body.general_info.gender
        }`
        let queryReligion = `SELECT * FROM Registration.CT_Religion Where ID = ${
            body.general_info.religion
        }`

        let Country = async (id : any) => {
            let queryCountry = `SELECT * FROM Registration.CT_Country Where ID = ${id}`
            let country = await repos.query(queryCountry)
            if (! country.length) 
                return ''
            
            return country[0].Desc_EN
        }
        let Subdistrict = async (id : any) => {
            let querySubdistrict = `SELECT * FROM Registration.CT_CityArea_1 WHERE ID = ${id}`
            let subdistrict = await repos.query(querySubdistrict)
            if (! subdistrict.length) 
                return ''
            
            return subdistrict[0].Desc_TC
        }
        let District = async (id : any) => {
            let queryDistrict = `SELECT * FROM Registration.CT_City_1 WHERE ID = ${id}`
            let district = await repos.query(queryDistrict)
            if (! district.length) 
                return ''
            
            return district[0].Desc_TC
        }
        let Province = async (id : any) => {
            let queryProvince = `SELECT * FROM Registration.CT_Province_1 WHERE ID = ${id}`
            let provice = await repos.query(queryProvince)
            if (! provice.length) 
                return ''
            
            return provice[0].Desc_TH
        }
        let PreferredLanguage = async (id : any) => {
            let querySubdistrict = `SELECT Desc_EN FROM Registration.CT_PreferredLanguage WHERE ID = ${id}`
            let subdistrict = await repos.query(querySubdistrict)
            if (! subdistrict.length) 
                return ''
            
            return subdistrict[0].Desc_EN
        }
        let Title = async (id : any) => {
            let queryTitle = `SELECT * FROM Registration.CT_Title Where ID = ${id}`
            let title = await repos.query(queryTitle)
            if (! title.length) 
                return null
            
            return title[0].Desc
        }
        let Relation = async (id : any) => {
            let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${id}`
            let relation = await repos.query(queryRelation)
            if (! relation.length) 
                return null
            
            return relation[0].Code
        }
        let FamilyRelation = async (id : any) => {
            let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${id}`
            let relation = await repos.query(queryRelation)
            if (! relation.length) 
                return null
            
            return relation[0].Desc
        }
        let FamilyDisease = async (id : any) => {
            let queryRelation = `SELECT * FROM Registration.CT_Diseases Where ID = ${id}`
            let disease = await repos.query(queryRelation)
            if (! disease.length) 
                return null
            
            return body.defaultlanguage == 'th' ? disease[0].DescTH : disease[0].DescEN
        }
        let Nation = await repos.query(queryNation)
        let Religion = await repos.query(queryReligion)
        let Gender = await repos.query(queryGender)

        let family = await Promise.all(body.siblings.family.map(async (item : any) : Promise < any > => {

            // let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${item.person}`
            // let relation = await repos.query(queryRelation)
            return {
                "id_patient_family": null,
                "id_patient_information": null,
                "relation": await FamilyRelation(item.person),
                "disease": null,
                "start": 0,
                "end": 0,
                "comment": await FamilyDisease(item.illness)
            }
        }));
        let social: any = new Array()

        let datadrugabuse = {
            "id_patient_social": null,
            "id_patient_information": null,
            "habit": "Substance Abuse",
            "quality": null,
            "detail": null,
            "comment": body.pediatric.c_drug
        }

        if (body.pediatric.drug) 
            social.push(datadrugabuse)
        
        let emergency = body.parent_info.parent.find((d : any) => d.contactemergency)
        let rpa = {
            "data": {
                "server": rpaSetting.SERVER,
                "server_type": rpaSetting.SERVER_TYPE,
                "id_patient_information": 126,
                "patient_code": "9xkevj",
                "hn": null,
                "title_th": await Title(body.general_info.title),
                "firstname_th": body.general_info.firstname.toUpperCase(),
                "middlename_th": body.general_info.middlename,
                "lastname_th": body.general_info.lastname.toUpperCase(),
                "title_en": null,
                "firstname_en": null,
                "middlename_en": null,
                "lastname_en": null,
                "nationality": Nation[0].Desc_EN,
                "religion": 4,
                "religion_desc": Religion[0].Desc_TH,
                "religion_desc_en": Religion[0].Desc_EN,
                "national_id": null,
                "passport_id": null,
                // "dob":`${dateDob.getFullYear()}-${("0" + (dateDob.getMonth() + 1)).slice(-2)}-${("0" + dateDob.getDate()).slice(-2)}`,
                "dob": dateDob,
                "age": null,
                "gender": body.general_info.gender,
                "gender_desc_en": Gender[0].Desc_EN,
                "gender_desc_th": Gender[0].Desc_TH,
                "marital_status": null,
                "preferrend_language": await PreferredLanguage(body.general_info.preferredlanguage),
                "occupation": null,
                "mobile_phone": (body.general_info.phone_no && body.general_info.phone_no.length == 10) ? body.general_info.phone_no : ".",
                "email": body.general_info.email,
                "home_telephone": null,
                "office_telephone": null,
                "permanent_address": body.present.address,
                "permanent_sub_district": await Subdistrict(body.present.subdistrict),
                "permanent_district": await District(body.present.districtid),
                "permanent_province": await Province(body.present.provinceid),
                "permanent_postcode": body.present.postcode,
                "permanent_country": await Country(body.present.country),
                "same_permanent": body.permanent.sameAddress ? 1 : 0,
                "present_address": body.permanent.sameAddress ? body.present.address : body.permanent.address,
                "present_sub_district": body.permanent.sameAddress ? await Subdistrict(body.present.subdistrict) : await Subdistrict(body.permanent.subdistrict),
                "present_district": body.permanent.sameAddress ? await District(body.present.districtid) : await District(body.permanent.districtid),
                "present_province": body.permanent.sameAddress ? await Province(body.present.provinceid) : await Province(body.permanent.provinceid),
                "present_postcode": body.permanent.sameAddress ? body.present.postcode : body.present.postcode,
                "present_country": body.permanent.sameAddress ? await Country(body.present.country) : await Country(body.permanent.country),
                "ec_firstname": emergency != undefined ? emergency.firstname : null,
                "ec_lastname": emergency != undefined ? emergency.lastname : null,
                "ec_relationship": await Relation(emergency.relation),
                "ec_relationship_other": emergency != undefined ? emergency.relation : null,
                "ec_telephone": emergency != undefined ? emergency.phoneno : null,
                "ec_email": emergency != undefined ? emergency.email : null,
                "ec_address_same_patient": emergency != undefined ? emergency.sameAddress ? 1 : 0 : null,
                "ec_address": emergency != undefined ? emergency.sameAddress ? body.permanent.address : emergency.address : null,
                "ec_sub_district": emergency != undefined ? emergency.sameAddress ? await Subdistrict(body.permanent.subdistrict) : await Subdistrict(emergency.subdistrict) : null,
                "ec_district": emergency != undefined ? emergency.sameAddress ? await District(body.permanent.districtid) : await District(emergency.districtid) : null,
                "ec_province": emergency != undefined ? emergency.sameAddress ? await Province(body.permanent.provinceid) : await Province(emergency.provinceid) : null,
                "ec_postcode": emergency != undefined ? emergency.sameAddress ? body.permanent.postcode : emergency.postcode : null,
                "ec_country": emergency != undefined ? emergency.sameAddress ? await Country(body.permanent.country) : await Country(emergency.country) : null,
                "fi_payment_method": body.parent_info.payment_method,
                "fi_company": body.parent_info.company,
                "date_created": null,
                "date_updated": null,
                "social_list": social,
                "family_list": family,
                "site": body.site,
                "location": body.location.CTLOC_Desc,
                "Truama": "No",
                "ARI": "No",
                "location_register": "1-Medical Record Department",
                "access_profile": "Registration Staff"
            }
        }

        let time = new Date();
        const filename = `${
            body.ID
        }+${
            time.getFullYear()
        }-${
            ("0" + (
                time.getMonth() + 1
            )).slice(-2)
        }-${
            time.getDate()
        }+${
            time.getTime()
        }.txt`
        const path = '/Process'
        let sendrpa = await axios.post(`http://10.105.10.50:8700/api/CpoeRegister/registerCpoe`, {path, filename, data: rpa})
        return
    }
    updateData() {
        return async (req : Request, res : Response) => {
            let body = req.body
            let repos = di.get("repos");
            if (body.type == 0) {
                await this.updateAdult(body)
                res.send({message: 'Success'})
            } else {
                await this.updateChild(body)
                res.send({message: 'Success'})
            }
        }
    }
    approveData() {
        return async (req : Request, res : Response) => {
            let body = req.body
            let repos = di.get("repos");
            if (body.type == 0) {
                await this.approveAdult(body)
                res.send({message: 'Success'})
            } else {
                await this.approveChild(body)
                res.send({message: 'Success'})
            }
        }
    }
    saveSignatureApprove() {
        return async (req : Request, res : Response) => {
            let {
                signatureHash,
                signatureImage,
                id,
                signType,
                consent,
                consentText
            } = req.body;
            let repos = di.get("repos");
            let query = `UPDATE Registration.Patient_Info SET Approve=1 WHERE ID=${id};`
            let insertSignature = `INSERT INTO Registration.Signature (PatientID, HashSiganture, Signature, SignType) VALUES(${id}, '${signatureHash}', '${signatureImage}', '${signType}');`
            await repos.query(query)
            await repos.query(insertSignature)
            res.send({message: 'Success'})
        }
    }

}

const router = Router();
const route = new registerRoute();

router.post("/", route.postRegister()).post("/search", route.getSearch()).post("/signature", route.saveSignature()).post("/update", route.updateData()).post("/getPendingData", route.getPendingData()).post("/approve", route.approveData()).post("/signatureApprove", route.saveSignatureApprove()).post("/getApprovedData", route.getApprovedData())
// .post("/print", route.addPrintJob())


export const register = router;
