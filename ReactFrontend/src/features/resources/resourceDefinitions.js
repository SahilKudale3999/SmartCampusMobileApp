const admin = ["ADMIN"];
const staff = ["ADMIN", "FACULTY"];
const all = ["ADMIN", "FACULTY", "STUDENT"];
const text = (name, required = false) => ({ name, label: name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()), type: "text", required });
const id = (name, required = true) => ({ ...text(name, required), type: "number" });
export const resources = [
  { key:"users", path:"users", label:"Users", endpoint:"/users", id:"userId", roles:admin, fields:[text("fullName",true), text("email",true), text("password"), text("phoneNo"), {name:"role",label:"Role",type:"select",options:["ADMIN","FACULTY","STUDENT"],required:true}], columns:["fullName","email","phoneNo","role","isActive"], actions:["activate","deactivate","password"] },
  { key:"courses", path:"courses", label:"Courses", endpoint:"/courses", id:"courseId", roles:all, fields:[text("courseName",true)], columns:["courseName"] },
  { key:"students", path:"students", label:"Students", endpoint:"/students", id:"studentId", roles:admin, fields:[id("userId"),id("courseId"),text("rollNo",true)], columns:["fullName","email","courseName","rollNo"] },
  { key:"faculty", path:"faculty", label:"Faculty", endpoint:"/faculty", id:"facultyId", roles:admin, fields:[id("userId"),text("department",true)], columns:["fullName","email","department","role"] },
  { key:"subjects", path:"subjects", label:"Subjects", endpoint:"/subject", id:"subjectId", roles:staff, fields:[text("subjectName",true),id("courseId"),id("facultyId")], columns:["subjectName","courseName","facultyName"] },
  { key:"assignments", path:"assignments", label:"Assignments", endpoint:"/assignments", id:"assignmentId", roles:staff, fields:[id("subjectId"),text("title",true),text("description"),{name:"deadline",label:"Deadline",type:"date"}], columns:["title","subjectName","description","deadline","createdAt"] },
  { key:"attendance", path:"attendance", label:"Attendance", endpoint:"/attendance", id:"attendanceId", roles:staff, listable:false, fields:[id("studentId"),id("subjectId"),{name:"status",label:"Status",type:"select",options:["PRESENT","ABSENT"],required:true},{name:"attendanceDate",label:"Attendance date",type:"date",required:true}], columns:["studentName","subjectName","status","attendanceDate"] },
  { key:"submissions", path:"submissions", label:"Submissions", endpoint:"/submissions", id:"submissionId", roles:staff, fields:[id("assignmentId"),id("studentId"),text("fileUrl"),{name:"gradeScore",label:"Grade score",type:"number"}], columns:["assignmentTitle","studentName","fileUrl","submittedAt","gradeScore"], actions:["grade"] },
  { key:"events", path:"events", label:"Events", endpoint:"/event", id:"eventId", roles:staff, fields:[text("eventName",true),text("description"),text("venue"),{name:"eventDate",label:"Event date",type:"date",required:true},id("createdBy")], columns:["eventName","venue","eventDate","createdByName"] },
  { key:"notices", path:"notices", label:"Notices", endpoint:"/notice", id:"noticeId", roles:staff, fields:[text("title",true),text("description",true),id("createdBy",false)], columns:["title","description","createdByName","createdAt"] },
];
