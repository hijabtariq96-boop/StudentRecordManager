const STORAGE_KEY = "studentRecordManagerRecords";

const studentForm = document.getElementById("studentForm");
const studentNameInput = document.getElementById("studentName");
const rollNumberInput = document.getElementById("rollNumber");
const programInput = document.getElementById("program");
const semesterInput = document.getElementById("semester");
const recordsBody = document.getElementById("recordsBody");
const searchInput = document.getElementById("searchInput");
const totalStudents = document.getElementById("totalStudents");
const formMessage = document.getElementById("formMessage");

let students = loadStudents();

function loadStudents() {
  try {
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    return savedRecords ? JSON.parse(savedRecords) : [];
  } catch (error) {
    return [];
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function showMessage(message, isSuccess = false) {
  formMessage.textContent = message;
  formMessage.style.color = isSuccess ? "#16845b" : "#d92d45";
}

function renderStudents(searchTerm = "") {
  recordsBody.replaceChildren();
  totalStudents.textContent = students.length;

  const term = searchTerm.trim().toLowerCase();
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(term) ||
    student.roll.toLowerCase().includes(term)
  );

  if (filteredStudents.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = students.length === 0
      ? "No student records yet. Add your first student above."
      : "No matching student records found.";
    row.appendChild(cell);
    recordsBody.appendChild(row);
    return;
  }

  filteredStudents.forEach((student) => {
    const row = document.createElement("tr");

    [student.name, student.roll, student.program, student.semester].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${student.name}`);
    deleteButton.addEventListener("click", () => deleteStudent(student.id));
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    recordsBody.appendChild(row);
  });
}

function deleteStudent(id) {
  const student = students.find((item) => item.id === id);
  if (!student) return;

  const confirmed = window.confirm(`Delete the record for ${student.name}?`);
  if (!confirmed) return;

  students = students.filter((item) => item.id !== id);
  saveStudents();
  renderStudents(searchInput.value);
  showMessage("Student record deleted successfully.", true);
}

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = studentNameInput.value.trim();
  const roll = rollNumberInput.value.trim();
  const program = programInput.value;
  const semester = semesterInput.value;

  if (!name || !roll || !program || !semester) {
    showMessage("Please complete all fields.");
    return;
  }

  const duplicateRoll = students.some(
    (student) => student.roll.toLowerCase() === roll.toLowerCase()
  );

  if (duplicateRoll) {
    showMessage("This roll number already exists. Please enter a unique roll number.");
    rollNumberInput.focus();
    return;
  }

  students.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    roll,
    program,
    semester
  });

  saveStudents();
  studentForm.reset();
  renderStudents(searchInput.value);
  showMessage("Student record added successfully.", true);
  studentNameInput.focus();
});

searchInput.addEventListener("input", () => {
  renderStudents(searchInput.value);
});

renderStudents();
