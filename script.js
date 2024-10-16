let className = '';
        let schoolYear = '';
        let students = [];

        const classForm = document.getElementById('class-form');
        const classNameInput = document.getElementById('class-name');
        const yearInput = document.getElementById('year-input');
        const studentForm = document.getElementById('student-form');
        const studentNameInput = document.getElementById('student-name');
        const bulkAddForm = document.getElementById('bulk-add-form');
        const bulkStudentsInput = document.getElementById('bulk-students');
        const studentTable = document.getElementById('student-table').getElementsByTagName('tbody')[0];
        const downloadForm = document.getElementById('download-form');
        const pdfNameInput = document.getElementById('pdf-name');
        const pdfColorInput = document.getElementById('pdf-color');
        const pdfFontSelect = document.getElementById('pdf-font');
        const previewPdfButton = document.getElementById('preview-pdf');
        const pdfPreviewDiv = document.getElementById('pdf-preview');
        const pdfIframe = document.getElementById('pdf-iframe');

        classForm.addEventListener('submit', function(e) {
            e.preventDefault();
            className = classNameInput.value.trim();
            schoolYear = yearInput.value.trim();
            if (className && schoolYear) {
                classNameInput.disabled = true;
                yearInput.disabled = true;
                this.querySelector('button').disabled = true;
                const header = document.querySelector('h1');
                header.style.opacity = '0';
                header.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    header.textContent = `Gestion de la classe: ${className} - ${schoolYear}`;
                    header.style.transition = 'all 0.5s ease';
                    header.style.opacity = '1';
                    header.style.transform = 'scale(1)';
                }, 300);
            }
        });

        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = studentNameInput.value.trim();
            addStudent(name);
        });

        bulkAddForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const names = bulkStudentsInput.value.split('\n').map(name => name.trim()).filter(name => name);
            names.forEach(addStudent);
            bulkStudentsInput.value = '';
        });

        function addStudent(name) {
            if (name) {
                students.push({name, interrogations: ['', '', '', ''], homework: ''});
                students.sort((a, b) => a.name.localeCompare(b.name, 'fr', {sensitivity: 'base'}));
                renderStudentTable();
                studentNameInput.value = '';
            }
        }

        function renderStudentTable() {
            studentTable.innerHTML = '';
            students.forEach((student, index) => {
                const row = studentTable.insertRow();
                const numberCell = row.insertCell(0);
                numberCell.textContent = index + 1;
                const nameCell = row.insertCell(1);
                nameCell.textContent = student.name;

                for (let i = 0; i < 4; i++) {
                    const interrogationCell = row.insertCell(i + 2);
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'interrogation-box';
                    input.value = student.interrogations[i];
                    input.addEventListener('input', (e) => {
                        student.interrogations[i] = e.target.value;
                    });
                    interrogationCell.appendChild(input);
                }

                const homeworkCell = row.insertCell(6);
                const homeworkInput = document.createElement('input');
                homeworkInput.type = 'text';
                homeworkInput.className = 'homework-input';
                homeworkInput.value = student.homework;
                homeworkInput.placeholder = "Notes sur les devoirs...";
                homeworkInput.addEventListener('input', (e) => {
                    student.homework = e.target.value;
                });
                homeworkCell.appendChild(homeworkInput);
            });
        }

        function generatePDF(forPreview = false) {
            const pdfName = pdfNameInput.value.trim() || 'liste_eleves';
            const pdfColor = pdfColorInput.value;
            const pdfFont = pdfFontSelect.value;
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFont(pdfFont, "bold");
            doc.setTextColor(pdfColor);
            doc.text(`Liste des élèves - ${className} - ${schoolYear}`, 14, 15);
            doc.setFont(pdfFont, "normal");
            doc.setTextColor("#000000");
            
            const tableData = students.map((student, index) => [
                index + 1,
                student.name,
                ...student.interrogations,
                student.homework
            ]);

            doc.autoTable({
                head: [['#', 'Nom de l\'élève', 'Inter. 1', 'Inter. 2', 'Inter. 3', 'Inter. 4', 'Devoirs']],
                body: tableData,
                startY: 25,
                styles: { fontSize: 10, cellPadding: 5, font: pdfFont },
                headStyles: { fillColor: pdfColor, textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [240, 248, 255] },
            });

            if (forPreview) {
                const pdfDataUri = doc.output('datauristring');
                pdfIframe.src = pdfDataUri;
                pdfPreviewDiv.style.display = 'block';
            } else {
                doc.save(`${pdfName}.pdf`);
            }
        }

        previewPdfButton.addEventListener('click', () => generatePDF(true));
        downloadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generatePDF();
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker not registered', err));
        }