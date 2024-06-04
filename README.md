# enrich-display

Create a view that will let me display the results of a query, the goal is to provide an answer along with the ability to display articles, videos, images, and buttons that will execute specific tasks. improve the styling of the provided react cmponent and use sample data to visualize what this display data would look like. import React, { useState, useEffect } from 'react';
import { Button, Modal, Accordion, AccordionSummary, AccordionDetails, CircularProgress, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { styled } from '@mui/material/styles';
import styles from './DisplaySearch.module.scss';
import { Source, Answer, QueryResponse, Links } from '@api/ask_ai.types';
import { MultiQuizModal } from '@features/uworld'; // Import the quiz modal component
import { getUworldDetails, RAGUworld } from "@api/uworld"; // Import the necessary functions
import { Uworld } from "@api/uworld.types"; // Import the types
import {submitQuery_Resources } from "@api/ask_ai";
import {fetchFolders, searchPDFs } from "@api/documents";
import { Document, Page, pdfjs } from 'react-pdf';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';
import { PDFDocument } from 'pdf-lib';

export const generateThumbnail = async (pdfUrl) => {
    const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPage(0);

    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    return canvas.toDataURL();
};

const CustomAccordion = styled(Accordion)({
  backgroundColor: '#2a2a2e',
  color: 'white',
  borderRadius: '0.5rem',
  '& .MuiAccordionSummary-root': {
    backgroundColor: '#353542',
    color: 'white',
  },
  '& .MuiAccordionDetails-root': {
    backgroundColor: '#2a2a2e',
    color: 'white',
  },
});

export const DisplaySearch: React.FC<QueryResponse & { query: string, focus: string | null, file: File | null }> = ({ sources, answer, links, query, focus, file }) => {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false); // State to manage the quiz modal
  const [quizQuestions, setQuizQuestions] = useState<Uworld[]>([]);
  const [quizDifficultyTags, setQuizDifficultyTags] = useState<Record<number, string>>({});
  const [showSources, setShowSources] = useState(false); // State to manage source visibility
  const [isRightPaneExpanded, setIsRightPaneExpanded] = useState(false); // State to manage right pane expansion
  const [checkedSources, setCheckedSources] = useState([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [PDFresults, setResults] = useState<Record<string, SearchResult[]>>({});
  const [enlargedPdf, setEnlargedPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Add loading state
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
        const loadFolders = async () => {
            try {
                const fetchedFolders = await fetchFolders();
                setFolders(fetchedFolders);
            } catch (error) {
                console.error("Error loading folders:", error);
            }
        };

        loadFolders();
    }, []);

   useEffect(() => {
        // Automatically select all folders and run the search when the component loads
        setSelectedFolders(folders);
    }, [folders]); // Run once when folders change (initial load)

  const handleAccordionClick = async (event, qids) => {
    event.stopPropagation(); // Prevent the default toggle behavior
    event.preventDefault(); // Prevent the default toggle behavior
    await handleQuizFromID(qids);
  };

  const handleQuizFromID = async (qid: string[]) => {
    try {
      const fetchedQuestions = await getUworldDetails(qid);
      const difficultyTags = fetchedQuestions.reduce((acc, question, index) => {
        acc[index] = question.difficulty || '';
        return acc;
      }, {});

      setQuizQuestions(fetchedQuestions);
      setQuizDifficultyTags(difficultyTags);
      setIsQuizModalOpen(true);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
    }
  };

  const toggleRightPane = (isExpanded) => {
    setIsRightPaneExpanded(isExpanded);
  };


  const handleCheckboxChange = (index) => {
    setCheckedSources((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleFolderCheckboxChange = (folder) => {
        setSelectedFolders((prevSelectedFolders) => {
            if (prevSelectedFolders.includes(folder)) {
                return prevSelectedFolders.filter((f) => f !== folder);
            } else {
                return [...prevSelectedFolders, folder];
            }
        });
    };

  const handleFolderClick = async () => {
        if (selectedFolders.length === 0) {
            alert('Please select at least one folder.');
            return;
        }
        try {
            const data = await searchPDFs(query, selectedFolders);
            const resultsByFolder: Record<string, SearchResult[]> = {};

            data.forEach(result => {
                // Adjust the PDF path to match the served URL
                result.pdf_path = `http://localhost:8000/pdfs/${result.pdf_path}`;
                if (!resultsByFolder[result.folder]) {
                    resultsByFolder[result.folder] = [];
                }
                resultsByFolder[result.folder].push(result);
            });

            setResults(resultsByFolder);
        } catch (error) {
            console.error("Error searching PDFs:", error);
        }
    };

  const fetchVideoLinks = async () => {
    if (videoLinks.length === 0) {  // Only fetch if videoLinks is empty
      try {
        const response = await submitQuery_Resources(query, focus, file);
        const videoUrls = response.data.additional_links.yt_urls || [];
        setVideoLinks(videoUrls);
      } catch (error) {
        console.error('Error fetching video links:', error);
      }
    }
  };

  const handleVideoAccordionClick = (isExpanded) => {
    toggleRightPane(isExpanded);
    fetchVideoLinks();
  };

  const getVideoIdFromUrl = (url) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
  };

  const handleFolderToggle = (query, folderName) => {
  };

  return (
    <div className={`${styles.displaySearchContainer} ${isRightPaneExpanded ? styles.expanded : ''}`}>
      <div className={styles.displaySearchMainContent}>
        <div className={styles.displaySearchAnswer}>
          <h2 className={styles.displaySearchH2}>Answer</h2>
          <p>{answer.text}</p>
          <ul>
            {answer.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className={`${styles.displaySearchRightPane} ${isRightPaneExpanded ? styles.expanded : ''}`}>
        <CustomAccordion className={styles.displaySearchAccordionContainer}>
          <AccordionSummary
            className={styles.displaySearchAccordionSummary}
            expandIcon={<AddIcon className={styles.displaySearchPlusButton} />}
            aria-controls="panel-sources-content"
            id="panel-sources-header"
            onClick={() => { setShowSources(!showSources); toggleRightPane(!isRightPaneExpanded); }} // Toggle right pane on click
          >
            <div className={styles.displaySearchAccordionButton}>
              <SearchIcon style={{ marginRight: '8px' }} />
              Show Sources
            </div>
          </AccordionSummary>
          <AccordionDetails className={styles.displaySearchAccordionDetails}>
            {showSources && (
              <div className={styles.displaySearchSourceSection}>
                <h2 className={styles.displaySearchH2}>Sources</h2>
                {sources.map((source) => (
                  <CustomAccordion key={source.index} className={styles.displaySearchSourceItem}>
                    <AccordionSummary
                      className={styles.displaySearchAccordionSummary}
                      expandIcon={<ExpandMoreIcon style={{ color: '#00bcd4' }} />}
                      aria-controls={`panel${source.index}-content`}
                      id={`panel${source.index}-header`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedSources.includes(source.index)}
                        onChange={() => handleCheckboxChange(source.index)}
                        onClick={(e) => e.stopPropagation()} // Prevent the checkbox from toggling the accordion
                        className={styles.displaySearchCheckbox}
                      />
                      <span>{source.index + 1}. </span>
                      <a href={source.source} target="_blank" rel="noopener noreferrer">
                        {source.title}
                      </a>
                    </AccordionSummary>
                    <AccordionDetails className={styles.displaySearchSourceDetails}>
                      <p>
                        <strong>Title:</strong> {source.metadata.citation_title}
                      </p>
                      <p>
                        <strong>Publication Date:</strong> {source.metadata.publication_date}
                      </p>
                      {source.metadata.doi && (
                        <p>
                          <strong>DOI:</strong>{' '}
                          <a href={source.metadata.doi} target="_blank" rel="noopener noreferrer">
                            {source.metadata.doi}
                          </a>
                        </p>
                      )}
                      <p>
                        <strong>Website Name:</strong> {source.metadata.website_name}
                      </p>
                    </AccordionDetails>
                  </CustomAccordion>
                ))}
              </div>
            )}
          </AccordionDetails>
        </CustomAccordion>

        <CustomAccordion className={styles.displaySearchAccordionContainer}>
          <AccordionSummary
            className={styles.displaySearchAccordionSummary}
            expandIcon={<AddIcon className={styles.displaySearchPlusButton} />}
            aria-controls="panel-images-content"
            id="panel-images-header"
            onClick={() => toggleRightPane(!isRightPaneExpanded)}
          >
           <div className={styles.displaySearchAccordionButton}>
              <MenuBookIcon onClick={() => handleFolderClick(query)} className={styles.searchButton} />
              Search Textbooks
          </div>

          </AccordionSummary>
          <AccordionDetails className={styles.displaySearchAccordionDetails}>
            {folders.map((folder, index) => (
              <div key={index}>
                  <AccordionSummary
                      className={styles.displaySearchAccordionSummary}
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel${index}-content`}
                      id={`panel${index}-header`}
                  >
                      <input
                          type="checkbox"
                          checked={selectedFolders.includes(folder)}
                          onChange={() => handleFolderCheckboxChange(folder)}
                          onClick={(e) => e.stopPropagation()}
                      />
                      <span>{index + 1}. </span>
                      <span>{folder}</span>
                      {loading[folder] && (
                        <CircularProgress size={20} style={{ marginLeft: '10px' }} />
                      )}
                      {!loading[folder] && PDFresults[folder]?.[0]?.pdf_path && (
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(PDFresults[folder][0].pdf_path, '_blank');
                          }}
                          style={{ marginLeft: '10px' }}
                        >
                          <OpenInNewIcon style={{ color: 'white' }} />
                        </IconButton>
                      )}
                  </AccordionSummary>
                  <AccordionDetails>
                        {PDFresults[folder] && PDFresults[folder].map((result, resultIndex) => (
                            <div key={resultIndex} className="pdf-thumbnail-container">
                                <div className="pdf-thumbnail">
                                    <p><strong>Page Number:</strong> {result.id}</p>
                                    <p><strong>Similarity Score:</strong> {result.similarity_score}</p>
                                </div>
                            </div>
                        ))}
                    </AccordionDetails>
              </div>
          ))}
        </AccordionDetails>
        </CustomAccordion>

        <CustomAccordion className={styles.displaySearchAccordionContainer}>
          <AccordionSummary
            className={styles.displaySearchAccordionSummary}
            expandIcon={<AddIcon className={styles.displaySearchPlusButton} />}
            aria-controls="panel-videos-content"
            id="panel-videos-header"
            onClick={() => handleVideoAccordionClick(!isRightPaneExpanded)} // Toggle right pane on click
          >
            <div className={styles.displaySearchAccordionButton}>
              <VideoLibraryIcon style={{ marginRight: '8px' }} />
              Search Videos
            </div>
          </AccordionSummary>
          <AccordionDetails className={styles.displaySearchAccordionDetails}>
            <div className={styles.videoGrid}>
              {videoLinks.length > 0 && videoLinks.map((url, index) => {
                const videoId = getVideoIdFromUrl(url);
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                return (
                  <div key={index} className={styles.videoLink}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <img src={thumbnailUrl} alt="Thumbnail" className={styles.thumbnail} />
                    </a>
                  </div>
                );
              })}
            </div>
          </AccordionDetails>
        </CustomAccordion>

        <CustomAccordion className={styles.displaySearchAccordionContainer}>
          <AccordionSummary
            className={styles.displaySearchAccordionSummary}
            expandIcon={<AddIcon className={styles.displaySearchPlusButton} />}
            aria-controls="panel-search-content"
            id="panel-search-header"
            onClick={(event) => event.stopPropagation()} // Prevent the default toggle behavior
          >
            <div
              className={styles.displaySearchAccordionButton}
              onClick={(event) => handleAccordionClick(event, links.qids)} // Call the custom click handler with event and qids
            >
              <SearchIcon style={{ marginRight: '8px' }} />
              Generate Quiz
            </div>
          </AccordionSummary>
          <AccordionDetails className={styles.displaySearchAccordionDetails}>
            {/* Add general search content here */}
          </AccordionDetails>
        </CustomAccordion>
      </div>
      <Modal open={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)}>
        <div className={styles.modalContent}>
          <MultiQuizModal
            isOpen={isQuizModalOpen}
            onClose={() => setIsQuizModalOpen(false)}
            questions={quizQuestions}
            onTagClick={() => {}} // Add any additional functionality if needed
          />
        </div>
      </Modal>
    </div>
  );

};

export default DisplaySearch;



## Collaborate with GPT Engineer

This is a [gptengineer.app](https://gptengineer.app)-synced repository 🌟🤖

Changes made via gptengineer.app will be committed to this repo.

If you clone this repo and push changes, you will have them reflected in the GPT Engineer UI.

## Tech stack

This project is built with React and Chakra UI.

- Vite
- React
- Chakra UI

## Setup

```sh
git clone https://github.com/GPT-Engineer-App/enrich-display.git
cd enrich-display
npm i
```

```sh
npm run dev
```

This will run a dev server with auto reloading and an instant preview.

## Requirements

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
