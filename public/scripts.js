document.addEventListener('DOMContentLoaded', function() {
  const starsContainer = document.querySelector('.stars');
  const starCount = 100;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    starsContainer.appendChild(star);
  }
});

document.getElementById("employeeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const empNo = document.getElementById("empNo").value;
  const name = document.getElementById("name").value;
  const laptopName = document.getElementById("laptopName").value;
  const laptopMemory = document.getElementById("laptopMemory").value;
  const laptopProcessor = document.getElementById("laptopProcessor").value;
  const laptopPassword = document.getElementById("laptopPassword").value; // Add this line
  const domainPassword = document.getElementById("domainPassword").value; // Add this line
  const description = document.getElementById("description").value;

  try {
    const response = await fetch("/addEmployee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        empNo,
        name,
        laptopName,
        laptopMemory,
        laptopProcessor,
        laptopPassword, // Add this line
        domainPassword, // Add this line
        description,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById("qrCode").src = data.qrCodeUrl;
      document.getElementById("empIdDisplay").innerText = empNo;
      document.getElementById("empNameDisplay").innerText = name;
      document.getElementById("empLaptopNameDisplay").innerText = laptopName || 'N/A';
      document.getElementById("empLaptopMemoryDisplay").innerText = laptopMemory || 'N/A';
      document.getElementById("empLaptopProcessorDisplay").innerText = laptopProcessor || 'N/A';
      document.getElementById("empDescriptionDisplay").innerText = description || 'N/A';
      document.getElementById("employeeDetailsContainer").style.display = 'block';
    } else {
      alert(data.message);
    }
    } catch (error) {
      console.error("Error:", error);
      alert("QR code Generated");
    }
});

