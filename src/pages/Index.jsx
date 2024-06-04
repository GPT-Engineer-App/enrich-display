import React, { useState, useEffect } from "react";
import { Container, VStack, Text, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Checkbox, Image, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, CircularProgress, useDisclosure, Box } from "@chakra-ui/react";
import { FaSearch, FaBook, FaVideo, FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import Navigation from "../components/Navigation.jsx";

const sampleData = {
  answer: {
    text: "This is the answer to your query.",
    points: ["Point 1", "Point 2", "Point 3"],
  },
  sources: [
    {
      index: 0,
      source: "https://example.com/source1",
      title: "Source 1",
      metadata: {
        citation_title: "Citation Title 1",
        publication_date: "2023-01-01",
        doi: "10.1234/example1",
        website_name: "Example Website 1",
      },
    },
    {
      index: 1,
      source: "https://example.com/source2",
      title: "Source 2",
      metadata: {
        citation_title: "Citation Title 2",
        publication_date: "2023-02-01",
        doi: "10.1234/example2",
        website_name: "Example Website 2",
      },
    },
  ],
  videoLinks: ["https://www.youtube.com/watch?v=example1", "https://www.youtube.com/watch?v=example2"],
  folders: ["Folder 1", "Folder 2"],
  PDFresults: {
    "Folder 1": [
      { id: 1, similarity_score: 0.9, pdf_path: "https://images.unsplash.com/photo-1667709525632-ca0ce065951d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHwxfHxwZGYlMjB0aHVtYm5haWwlMjAxfGVufDB8fHx8MTcxNzUyMjkzM3ww&ixlib=rb-4.0.3&q=80&w=1080" },
      { id: 2, similarity_score: 0.8, pdf_path: "https://images.unsplash.com/photo-1600439614353-174ad0ee3b25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHwxfHxwZGYlMjB0aHVtYm5haWwlMjAyfGVufDB8fHx8MTcxNzUyMjkzNHww&ixlib=rb-4.0.3&q=80&w=1080" },
    ],
    "Folder 2": [{ id: 3, similarity_score: 0.85, pdf_path: "https://images.unsplash.com/photo-1701486822668-84a4bd93b059?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MDcxMzJ8MHwxfHNlYXJjaHwxfHxwZGYlMjB0aHVtYm5haWwlMjAzfGVufDB8fHx8MTcxNzUyMjkzNHww&ixlib=rb-4.0.3&q=80&w=1080" }],
  },
};

const Index = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [checkedSources, setCheckedSources] = useState([]);

  const handleCheckboxChange = (index) => {
    setCheckedSources((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const handleFolderCheckboxChange = (folder) => {
    setSelectedFolders((prevSelectedFolders) => (prevSelectedFolders.includes(folder) ? prevSelectedFolders.filter((f) => f !== folder) : [...prevSelectedFolders, folder]));
  };

  const getVideoIdFromUrl = (url) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("v");
  };

  return (
    <Container maxW="container.lg" py={10}>
      <Navigation />
      <VStack spacing={8} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          Answer
        </Text>
        <Text>{sampleData.answer.text}</Text>
        <ul>
          {sampleData.answer.points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>

        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton>
              <FaSearch />
              <Box flex="1" textAlign="left" ml={2}>
                Show Sources
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {sampleData.sources.map((source) => (
                <Accordion key={source.index} allowMultiple>
                  <AccordionItem>
                    <AccordionButton>
                      <Checkbox isChecked={checkedSources.includes(source.index)} onChange={() => handleCheckboxChange(source.index)} onClick={(e) => e.stopPropagation()} />
                      <Box flex="1" textAlign="left" ml={2}>
                        {source.title}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Text>
                        <strong>Title:</strong> {source.metadata.citation_title}
                      </Text>
                      <Text>
                        <strong>Publication Date:</strong> {source.metadata.publication_date}
                      </Text>
                      {source.metadata.doi && (
                        <Text>
                          <strong>DOI:</strong>{" "}
                          <a href={source.metadata.doi} target="_blank" rel="noopener noreferrer">
                            {source.metadata.doi}
                          </a>
                        </Text>
                      )}
                      <Text>
                        <strong>Website Name:</strong> {source.metadata.website_name}
                      </Text>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              ))}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <FaBook />
              <Box flex="1" textAlign="left" ml={2}>
                Search Textbooks
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {sampleData.folders.map((folder, index) => (
                <Accordion key={index} allowMultiple>
                  <AccordionItem>
                    <AccordionButton>
                      <Checkbox isChecked={selectedFolders.includes(folder)} onChange={() => handleFolderCheckboxChange(folder)} onClick={(e) => e.stopPropagation()} />
                      <Box flex="1" textAlign="left" ml={2}>
                        {folder}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      {sampleData.PDFresults[folder] &&
                        sampleData.PDFresults[folder].map((result, resultIndex) => (
                          <Box key={resultIndex} mb={4}>
                            <Text>
                              <strong>Page Number:</strong> {result.id}
                            </Text>
                            <Text>
                              <strong>Similarity Score:</strong> {result.similarity_score}
                            </Text>
                            <Image src={result.pdf_path} alt={`PDF Thumbnail ${resultIndex + 1}`} />
                          </Box>
                        ))}
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              ))}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <FaVideo />
              <Box flex="1" textAlign="left" ml={2}>
                Search Videos
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4}>
                {sampleData.videoLinks.map((url, index) => {
                  const videoId = getVideoIdFromUrl(url);
                  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                  return (
                    <Box key={index} w="100%">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Image src={thumbnailUrl} alt="Thumbnail" />
                      </a>
                    </Box>
                  );
                })}
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <FaPlus />
              <Box flex="1" textAlign="left" ml={2}>
                Generate Quiz
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Button onClick={onOpen}>Open Quiz Modal</Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Quiz Modal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Quiz content goes here...</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Index;
