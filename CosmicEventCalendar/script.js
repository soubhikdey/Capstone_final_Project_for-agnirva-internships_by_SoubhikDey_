document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.querySelector('.calendar-grid');
    const monthYearDisplay = document.getElementById('monthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const yearSelect = document.getElementById('yearSelect'); 
    const imageTitle = document.getElementById('imageTitle'); 
    const apodImage = document.getElementById('epicImage'); 
    const imageDescription = document.getElementById('imageDescription');
    const imageCredit = document.getElementById('imageCredit');

    
    const NASA_API_KEY = 'pvxf0pf0RhWXwDMhn2K3u7t7hwjoZEWshMLXeIXv';

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDateElement = null;

    
    let initialDate = new Date();
    fetchApodImage(formatDateForApod(initialDate));
    populateYearDropdown(); 

    async function fetchApodImage(dateString) {
        
        imageTitle.textContent = "Loading...";
        apodImage.src = "https://placehold.co/600x400/000000/FFFFFF?text=Fetching+Cosmic+Image...";
        apodImage.alt = "Loading cosmic image";
        imageDescription.textContent = "Retrieving astronomical picture and explanation...";
        imageCredit.textContent = "";
        apodImage.style.cursor = 'default'; 
        apodImage.onclick = null; 

        const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${dateString}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`No APOD available for ${dateString}. Please try a past date, or a different valid date.`);
                }
                throw new Error(`Failed to fetch APOD: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.media_type === 'image') {
                apodImage.src = data.url;
                apodImage.alt = data.title;
                imageTitle.textContent = data.title;
                imageDescription.textContent = data.explanation;
                imageCredit.textContent = data.copyright ? `Credit: ${data.copyright}` : 'Credit: NASA APOD';
            } else if (data.media_type === 'video') {
                apodImage.src = data.thumbnail_url || "https://placehold.co/600x400/000000/FFFF00?text=Video+Available%0AClick+for+Link";
                apodImage.alt = "Video not displayed directly. Click for link.";
                imageTitle.textContent = data.title;
                imageDescription.textContent = `This APOD is a video. You can view it here: \n\n${data.explanation}`;
                imageCredit.textContent = data.copyright ? `Credit: ${data.copyright}` : 'Credit: NASA APOD';
                apodImage.style.cursor = 'pointer';
                apodImage.onclick = () => window.open(data.url, '_blank');
            } else {
                throw new Error('Unknown media type encountered.');
            }

        } catch (error) {
            console.error('Error fetching APOD image:', error);
            imageTitle.textContent = "Image Not Available";
            apodImage.src = "https://placehold.co/600x400/FF0000/FFFFFF?text=Error%20Loading%20Image";
            apodImage.alt = "Error loading image";
            imageDescription.textContent = `Could not load APOD for ${dateString}. ${error.message}`;
            imageCredit.textContent = "";
        }
    }

    
    function formatDateForApod(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function populateYearDropdown() {
        yearSelect.innerHTML = ''; 
        const startYear = 1995; 
        const endYear = new Date().getFullYear(); 

        for (let year = endYear; year >= startYear; year--) { 
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true; 
            }
            yearSelect.appendChild(option);
        }
    }

    function renderCalendar() {
        calendarGrid.innerHTML = `
            <div class="day-name">Sun</div>
            <div class="day-name">Mon</div>
            <div class="day-name">Tue</div>
            <div class="day-name">Wed</div>
            <div class="day-name">Thu</div>
            <div class="day-name">Fri</div>
            <div class="day-name">Sat</div>
        `;

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        const currentSelectedDate = selectedDateElement ? selectedDateElement.dataset.date : null;

        monthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('date-cell', 'inactive');
            calendarGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = document.createElement('div');
            dateCell.classList.add('date-cell');
            dateCell.textContent = day;
            const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dateCell.dataset.date = fullDate;

            
            if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dateCell.classList.add('current-day');
            }
            
            if (fullDate === currentSelectedDate) {
                dateCell.classList.add('selected');
                selectedDateElement = dateCell;
            }

            dateCell.addEventListener('click', () => {
                if (selectedDateElement) {
                    selectedDateElement.classList.remove('selected');
                }
                dateCell.classList.add('selected');
                selectedDateElement = dateCell;

                const selectedDate = dateCell.dataset.date;
                fetchApodImage(selectedDate);
            });

            calendarGrid.appendChild(dateCell);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
            populateYearDropdown(); 
            yearSelect.value = currentYear; 
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
            populateYearDropdown(); 
            yearSelect.value = currentYear; 
        }
        renderCalendar();
    });

    yearSelect.addEventListener('change', () => {
        currentYear = parseInt(yearSelect.value);
        renderCalendar();
    });

    renderCalendar(); 
});