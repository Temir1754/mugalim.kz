import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

const templateName = "ksp_template.docx";
const templatePath = path.join(process.cwd(), "src", "templates", templateName);

try {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  const docXml = zip.file("word/document.xml").asText();
  
  const tags = docXml.match(/\[([^\]]+)\]/g);
  
  console.log("Full tag sequence:", tags);
} catch (error) {
  console.error("Error inspecting template:", error);
}
