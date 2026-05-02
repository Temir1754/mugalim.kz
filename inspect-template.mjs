import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

const templateName = "ksp_template.docx";
const templatePath = path.join(process.cwd(), "src", "templates", templateName);

try {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  
  // Docxtemplater tags are usually in word/document.xml
  const docXml = zip.file("word/document.xml").asText();
  
  // Use regex to find all [...] tags
  const tags = docXml.match(/\[([^\]]+)\]/g);
  
  console.log("Found tags in template:", [...new Set(tags)]);
} catch (error) {
  console.error("Error inspecting template:", error);
}
