# SEO Suite Project Diagrams

This document contains the Flow Chart and Data Flow Diagrams (DFD) for the SEO Suite project, suitable for a college presentation.

## 1. Flow Chart
The flow chart illustrates the logical sequence of operations for generating SEO-optimized content.

```mermaid
flowchart TD
    Start([Start]) --> Input[User provides Text Prompt & Image/URL]
    Input --> ProcessImages{Images Provided?}
    ProcessImages -- Yes --> ConvertImages[Convert Images to Base64]
    ProcessImages -- No --> Error[Show Error: Image Required]
    Error --> Input
    ConvertImages --> BuildPrompt[Formulate SEO Expert Prompt]
    BuildPrompt --> CallGemini[Invoke Gemini AI Model]
    CallGemini --> ReceiveContent[Receive Generated Content]
    ReceiveContent --> ParseJSON[Parse JSON Content]
    ParseJSON --> PlagiarismCheck[Run Plagiarism Check]
    PlagiarismCheck --> Display[Display Results & Plagiarism Score]
    Display --> End([End])
```

---

## 2. Data Flow Diagrams (DFD)

### Level 0: Context Diagram
The Context Diagram shows the system boundary and its interactions with external entities.

```mermaid
graph LR
    User((User)) -- "Prompts & Images" --> System["AI SEO Suite System"]
    System -- "SEO Content & Plagiarism Report" --> User
    System -- "Base64 Images & Prompt" --> Gemini["Gemini AI (External API)"]
    Gemini -- "Generated Text/JSON" --> System
```

---

### Level 1: Process Diagram
Level 1 breaks down the system into its primary functional processes.

```mermaid
graph TD
    User((User))
    P1[1.0 Data Acquisition & Pre-processing]
    P2[2.0 AI Content Generation]
    P3[3.0 Post-processing & Plagiarism Check]
    DS1[(Local Storage / Cache)]
    Gemini["Gemini AI"]

    User -- "Upload Image / URL / Prompt" --> P1
    P1 -- "Base64 Image Data" --> P2
    P2 -- "Contextual Prompt & Images" --> Gemini
    Gemini -- "AI Generated Content" --> P2
    P2 -- "Raw Content" --> P3
    P3 -- "Text for Check" --> P3
    P3 -- "Plagiarism Results" --> User
    P3 -- "SEO Results" --> User
```

---

### Level 2: Detailed Process Diagram
Level 2 provides a deeper look into the specific sub-processes.

#### 2.1 Content Generation (Decomposed Process 2.0)
```mermaid
graph TD
    P1["1.0 Pre-processed Data"] -- "Images & Prompt" --> P2_1[2.1 Construct SEO Prompt Template]
    P2_1 -- "Formatted Prompt" --> P2_2[2.2 API Invocation]
    P2_2 -- "Request" --> Gemini["Gemini AI"]
    Gemini -- "Response" --> P2_2
    P2_2 -- "Raw JSON String" --> P2_3[2.3 JSON Parser]
    P2_3 -- "Structured Data" --> P3["3.0 Post-processing"]
```

#### 2.2 Plagiarism Checking (Decomposed Process 3.0)
```mermaid
graph TD
    P2["2.0 Structured Data"] -- "Generated Text" --> P3_1[3.1 TF-IDF Vectorization]
    P3_1 -- "Vector Matrix" --> P3_2[3.2 Cosine Similarity Calc]
    P3_2 -- "Similarity Score" --> P3_3[3.3 Verdict Generation]
    P3_3 -- "Final Report" --> User((User))
    Ref[(Reference Corpus)] -- "Text Samples" --> P3_1
```
