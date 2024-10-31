window.addEventListener("load", function() {
    setTimeout(() => {
        document.querySelector(".emp").classList.add("show-content");
    }, 4000); // Delay matches heading animation time
});


  const apiUrl = 'http://localhost:3000/employees';

document.getElementById('employeeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const position = document.getElementById('position').value;
    const salary = document.getElementById('salary').value;

    const employee = {
        name,
        email,
        position,
        salary
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message); // Handle errors (like duplicate email)
            });
        }
        return response.json();
    })
    .then(data => {
        alert(data.message); // Alert success message
        loadEmployees(); // Refresh employee list
    })
    .catch(error => {
        alert(error.message); // Alert duplicate email message or other errors
    });

    // Reset the form after submission
    document.getElementById('employeeForm').reset();
});

function loadEmployees() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const employeeTable = document.getElementById('employeeTable').getElementsByTagName('tbody')[0];
            employeeTable.innerHTML = ''; // Clear the table
            data.forEach(employee => {
                const newRow = employeeTable.insertRow();

                newRow.insertCell(0).textContent = employee.name;
                newRow.insertCell(1).textContent = employee.email;
                newRow.insertCell(2).textContent = employee.position;
                newRow.insertCell(3).textContent = employee.salary;

                const actionsCell = newRow.insertCell(4);

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.classList.add('edit-btn');
                editButton.onclick = () => {
                    editEmployee(employee);
                };

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');
                deleteButton.onclick = () => {
                    deleteEmployee(employee.id);
                };

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);
            });
        });
}

function editEmployee(employee) {
    document.getElementById('name').value = employee.name;
    document.getElementById('email').value = employee.email;
    document.getElementById('position').value = employee.position;
    document.getElementById('salary').value = employee.salary;

    fetch(`${apiUrl}/${employee.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadEmployees();
    })
    .catch(error => console.error('Error:', error));
}

function deleteEmployee(id) {
    fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadEmployees();
    })
    .catch(error => console.error('Error:', error));
}

window.onload = loadEmployees;
