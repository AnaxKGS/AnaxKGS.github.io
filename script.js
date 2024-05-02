$(document).ready(function() {
    let questionsData = null; // Will store questions.json

    // 1. Load questions.json
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questionsData = data;
            populateCertificateSelect(); 
        });

    $('#startQuizBtn').show();
    $('#certificate-select').collapse('show');


    // Certificate Fetch and Population
    function populateCertificateSelect() {
        const certificateSelect = $("#certificates");
        //$("#topic-select").removeClass('hidden');

        // Loop through certificates in JSON
        $.each(questionsData, function(index, certificate) {
            certificateSelect.append(`<option value="${certificate.certificate}">
                                      ${certificate.certificate}
                                     </option>`);
        });
    }

    // Event Listener: Certificate Selection
    $("#certificates").change(function() {
        const selectedCertificate = $(this).val();

        if (selectedCertificate !== "") {
            populateTopicSelect(selectedCertificate); 
            $("#topic-select").collapse('show');
        } else {
            $("#topic-select").collapse('hide'); 
        }
    });

    function populateTopicSelect(certificateCode) {
        const topicList = $("#topic-list");
        topicList.empty(); // Clear any previous topics
    
        // Filter topics based on selected certificate
        const relevantTopics = questionsData.find(cert => cert.certificate === certificateCode).topics; 
    
        // Populate topic dropdown
        $.each(relevantTopics, function(index, topic) {
            const switchId = `topic-switch-${index}`; // Unique ID for each switch
    
            topicList.append(`
                <div class="form-check form-switch">
                      <input class="form-check-input topic-switch" type="checkbox" id="${switchId}" value="${topic.topicName}">
                      <label class="form-check-label" for="${switchId}">${topic.topicName}</label>
                </div>
            `);
        });
    }

    function getSelectedTopics() {
        const selectedTopics = [];
        $(".topic-switch:checked").each(function() {
          selectedTopics.push($(this).val());
        });
        return selectedTopics;
      }

    function updateStartButtonState() {
        const selectedTopics = getSelectedTopics();
        $('#startQuizBtn').prop('disabled', selectedTopics.length === 0);
      }
      
      // Event Listener for Switch Changes
      $('#topic-list').on('change', '.topic-switch', updateStartButtonState); 
      
      // Initial Button State Check
      updateStartButtonState(); 
      
      // Function to start quiz (when button is clicked)
      $('#startQuizBtn').click(function() {
        const selectedCertificate = $('#certificates').val();
        const selectedTopics = getSelectedTopics();
     
        // Check if a certificate is selected 
        if (selectedCertificate) {
          startQuiz(selectedCertificate, selectedTopics); // Implement your startQuiz function
        } else {
            // Handle the case where no certificate is selected (e.g., display a message)
            alert("Please select a certificate"); 
        }
    });

    function startQuiz(certificate, topics) {
        const filteredQuestions = filterQuestionsByCertificateAndTopics(certificate, topics); 
        const randomQuestions = getRandomQuestions(filteredQuestions, 20);

        $('#certificate-select').collapse('hide');
        $('#topic-select').collapse('hide');
        $('#startQuizBtn').hide();
        $('#title').text(`${certificate} Quiz`);
        
        setTimeout(function() {
            buildQuizUI(randomQuestions); 
            $('#quiz-area').collapse('show'); 
        }, 300);
    } 
    
    function filterQuestionsByCertificateAndTopics(certificate, topics) {
        // Access your questionsData
        let filteredQuestions = questionsData.filter(cert => cert.certificate === certificate);
    
        filteredQuestions = filteredQuestions[0].topics.filter(topic => topics.includes(topic.topicName));
    
        // Flatten the array to get all questions together from the selected topics
        return [].concat(...filteredQuestions.map(topic => topic.questions)); 
    }
    
    function getRandomQuestions(questions, numQuestions) {
        if (questions.length < numQuestions) {
            console.log(questions.length);
            // Handle the error if there aren't enough questions
            throw new Error("Not enough questions available"); 
        }
    
        const shuffled = [...questions]; 
    
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
        }
    
        return shuffled.slice(0, numQuestions);
    }
    
    function buildQuizUI(questions) {
        const quizContainer = $("#quiz-area");
        quizContainer.empty(); 
        
        let currentQuestionIndex = 0; 
        
        function displayQuestion() {
            const questionData = questions[currentQuestionIndex];
            quizContainer.html(`
                <div class="card">
                    <div class="card-header">
                        Question ${currentQuestionIndex + 1} of 20
                    </div>
                    <div id="question" class="card-body">
                        <h5 class="card-title">${questionData.question}</h5>
                        <div class="answer-options"></div>
                        <button class="btn btn-primary mt-3" id="checkAnswerBtn">Check</button>
                        <p class="d-inline-flex gap-1">
                            <div class="d-flex justify-content-between">
                                <button class="btn btn-primary mt-3 hidden" id="nextQuestionBtn">Next</button>
                                <button class="btn btn-outline-secondary mt-3 hidden" id="showExplanationBtn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">❔</button>
                            </div>
                        </p>
                        <div class="collapse" id="collapseExample">
                            <div class="card card-body">                        
                                <div class="explanation" id="explanation-${currentQuestionIndex}">
                                ${questionData.explanation || "No explanation provided"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            // Populate answer options dynamically
            const answerOptionsContainer = quizContainer.find('.answer-options');
            questionData.options.forEach((option, index) => {
            answerOptionsContainer.append(`
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="answer" id="option${index}" value="${index}">
                    <label class="form-check-label" for="option${index}">
                    ${option}
                    </label>
                </div>
            `);
            });
        }

        // quizContainer.on('click', '#showExplanationBtn', function() {
        //     const explanationContainer = quizContainer.find('.explanation');
        //     explanationContainer.toggleClass('hidden'); // Toggle visibility
        // });

        quizContainer.on('click', '#nextQuestionBtn', function() {
            const selectedAnswer = quizContainer.find('input[name="answer"]:checked').val();
        
            // Logic to check the answer against questionData.correctAnswer
            // ...
        
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
              displayQuestion(); 
            } else {
              // End of quiz - display results, etc.
            }
        });

        quizContainer.on('click', '#checkAnswerBtn', function() {
            const selectedAnswer = quizContainer.find('input[name="answer"]:checked').val();
            const isCorrect = (selectedAnswer == questions[currentQuestionIndex].correctAnswer); // Use the passed questionData
            displayFeedback(isCorrect);
        
            // Show next and explanation buttons
            $('#nextQuestionBtn').removeClass('hidden');
            $('#showExplanationBtn').removeClass('hidden');
            $(this).addClass('hidden'); // Hide the Check Question button
        });


        function displayFeedback(isCorrect) {
            // Provide feedback to the user (ex: display a message or change styling)
            const feedbackDiv = $('<div />').addClass('feedback').text(isCorrect ? 'That\'s correct! ✅' : 'That\'s incorrect... ❌');
            quizContainer.find('#question').append(feedbackDiv); 
        }

        displayQuestion();
    }

});