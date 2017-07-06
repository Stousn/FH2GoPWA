"use strict";
// transform xml-data to json-object ... only work with xml-data from FHPI-Server
export class XMLTransformer {
  constructor() {}
  // transform MARKS-XML into a json-Object
  static transformMarks(xml) {
    let terms = xml.getElementsByTagName("Term");

    let marks = {};

    Array.from(terms).forEach(term => {
      let termName = term.getAttribute("name");

      if (termName == "Wichtige Meldung") {
        reject("Serverside Problem / Wrong User/Pass");
      }

      let courses = term.getElementsByTagName("Course");
      marks[termName] = {};
      Array.from(courses).forEach(course => {
        let courseTitle = course.querySelector("Title").innerHTML;
        let courseGrade = course.querySelector("Grade").innerHTML;
        let markId = course.querySelector("MarkId").innerHTML;
        marks[termName][markId] = {
          title: courseTitle,
          grade: courseGrade
        };
      });
    });

    return marks;
  }
 // transform MARKS-Details-XML into a json-Object
  static transformMarksDetails(xml, id) {
    let statistics = {};
    let participants = null;
    let excellent = null;
    let good = null;
    let satisfactory = null;
    let sufficient = null;
    let unsatisfactory = null;
    let average = null;

    // Not each Element has to be in the XML-Document -> check if not null
    let participantsEl = xml.querySelector("Participants");
    if (participantsEl !== null) {
      participants = participantsEl.innerHTML;
    }

    let excellentEl = xml.querySelector("Excellent");
    if (excellentEl !== null) {
      excellent = excellentEl.innerHTML;
    }

    let goodEl = xml.querySelector("Good");
    if (goodEl !== null) {
      good = goodEl.innerHTML;
    }

    let satisfactoryEl = xml.querySelector("Satisfactory");
    if (satisfactoryEl !== null) {
      satisfactory = satisfactoryEl.innerHTML;
    }

    let sufficientEl = xml.querySelector("Sufficient");
    if (sufficientEl !== null) {
      sufficient = sufficientEl.innerHTML;
    }

    let unsatisfactoryEl = xml.querySelector("Unsatisfactory");
    if (unsatisfactoryEl !== null) {
      unsatisfactory = unsatisfactoryEl.innerHTML;
    }

    let averageEl = xml.querySelector("Average");
    if (averageEl !== null) {
      average = averageEl.innerHTML;
    }

    statistics[id] = {
      participants: participants,
      excellent: excellent,
      good: good,
      satisfactory: satisfactory,
      sufficient: sufficient,
      unsatisfactory: unsatisfactory,
      average: average
    };

    return statistics;
  }
 // transform Schedule-XML into a json-Object
  static transformSchedule(xml, group) {
    let events = xml.querySelectorAll("Event");
    let i = 0;
    let schedule = {};
    Array.from(events).forEach(event => {
      let eventTitle = event.querySelector("Title").innerHTML;
      let eventLecturer = event.querySelector("Lecturer").innerHTML;
      let eventLocation = event.querySelector("Location").innerHTML;
      let eventType = event.querySelector("Type").innerHTML;
      let eventStart = event.querySelector("Start").innerHTML;
      let eventEnd = event.querySelector("End").innerHTML;

      if (
        group && eventType.startsWith("G") && eventType != group.toUpperCase()
      ) {
        return;
      }

      schedule[i] = {
        title: eventTitle,
        lecturer: eventLecturer,
        location: eventLocation,
        type: eventType,
        start: eventStart,
        end: eventEnd
      };
      i++;
    });
    return schedule;
  }
 // transform EXAMS-XML into a json-Object
  static transformExams(xml) {
    let all_exams = {};
    let terms = xml.querySelectorAll("Term");
    Array.from(terms).forEach(term => {
      let termName = term.getAttribute("name");
      let exams = term.querySelectorAll("Exam");
      all_exams[termName] = {};
      Array.from(exams).forEach(exam => {
        let examId = exam.querySelector("Id").innerHTML;
        let examTitle = exam.querySelector("Title").innerHTML;
        let examType = exam.querySelector("Type").innerHTML;
        let examMode = exam.querySelector("Mode").innerHTML;
        let examDate = exam.querySelector("DateUnix").innerHTML;
        let examRegUntil = exam.querySelector("RegistrationEndUnix").innerHTML;
        let examState = exam.querySelector("ExamStatus").innerHTML;
        let examDateStr = exam.querySelector("Date").innerHTML;
        let examRegUntilStr = exam.querySelector("RegistrationEnd").innerHTML;

        all_exams[termName][examTitle + examDate] = {
          title: examTitle,
          type: examType,
          mode: examMode,
          date: examDate,
          regUntil: examRegUntil,
          state: examState,
          dateStr: examDateStr,
          regUntilStr: examRegUntilStr
        };
      });
    });

    return all_exams;
  }
}
