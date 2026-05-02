import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

const templateName = "ksp_template.docx";
const templatePath = path.join(process.cwd(), "src", "templates", templateName);

try {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  const docXml = zip.file("word/document.xml").asText();
  
  // Strip all XML tags to just see the text content with potential tags
  const textOnly = docXml.replace(/<[^>]+>/g, "");
  
  // Find all [anything]
  const tags = textOnly.match(/\[[^\]]+\]/g);
  
  console.log("Discovery tags from cleaned text:", tags);
} catch (error) {
  console.error("Error inspecting template:", error);
}
