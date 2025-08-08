// Client-side script to send form data to the AI comment generator
// and display the result in the textarea.

(function () {
  'use strict';

  // Select the generate button and output textarea on the try-now page
  var generateBtn = document.querySelector('.try-now-button');
  var outputArea = document.querySelector('.try-now-textarea');

  /**
   * Retrieve the value of an input or select element by CSS selector.
   * For checkboxes, return the boolean checked state.
   *
   * @param {string} selector
   * @returns {string|boolean}
   */
  function getValue(selector) {
    var el = document.querySelector(selector);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked;
    return el.value ? el.value.trim() : '';
  }

  /**
   * Display generated text in the output textarea.
   *
   * @param {string} text
   */
  function setOutput(text) {
    if (outputArea) {
      outputArea.value = text;
    }
  }

  /**
   * Build a payload object from form inputs for the API call.
   *
   * @returns {{ name: string, level: string, strengths: string[], weaknesses: string[], advance: boolean }}
   */
  function buildPayload() {
    return {
      name: getValue('.student-first-name'),
      level: getValue('.try-now-select'),
      strengths: [getValue('.try-now-select1'), getValue('.try-now-select2')].filter(Boolean),
      weaknesses: [getValue('.try-now-select3'), getValue('.try-now-select4')].filter(Boolean),
      advance: getValue('.try-now-checkbox') === true
    };
  }

  /**
   * Send a POST request to the backend and update the textarea with the response.
   *
   * @param {Object} payload
   */
  async function generateComments(payload) {
    setOutput('Generating…');
    try {
      var res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      setOutput(data.text || 'No comment returned');
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', function (e) {
      e.preventDefault();
      generateComments(buildPayload());
    });
  }
})();