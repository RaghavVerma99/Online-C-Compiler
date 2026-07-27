/**
 * C++ Code Formatter
 * Handles indentation, spacing, and code organization
 */

const INDENT = "    "; // 4 spaces

export function formatCpp(code) {
  if (!code || typeof code !== "string") return code;

  const lines = code.split("\n");
  const formatted = [];
  let indentLevel = 0;
  let insideBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Handle block comments
    if (insideBlockComment) {
      formatted.push(INDENT.repeat(indentLevel) + line);
      if (line.includes("*/")) {
        insideBlockComment = false;
      }
      continue;
    }

    if (line.startsWith("/*")) {
      insideBlockComment = true;
      formatted.push(INDENT.repeat(indentLevel) + line);
      continue;
    }

    // Skip empty lines but preserve single blank line
    if (line === "") {
      if (formatted.length > 0 && formatted[formatted.length - 1] !== "") {
        formatted.push("");
      }
      continue;
    }

    // Decrease indent for closing braces
    if (line.startsWith("}") || line.startsWith(")") || line.startsWith("]")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Format the line
    line = formatLine(line);

    // Add proper indentation
    formatted.push(INDENT.repeat(indentLevel) + line);

    // Increase indent for opening braces
    if (line.endsWith("{") || line.endsWith("(") || line.endsWith("[")) {
      indentLevel++;
    }

    // Handle lines with both closing and opening braces (e.g., "} else {")
    if (line.includes("}")) {
      const closingBraces = (line.match(/\}/g) || []).length;
      const openingBraces = (line.match(/\{/g) || []).length;
      if (openingBraces > closingBraces) {
        indentLevel += openingBraces - closingBraces;
      }
    }
  }

  // Remove trailing blank lines
  while (formatted.length > 0 && formatted[formatted.length - 1] === "") {
    formatted.pop();
  }

  return formatted.join("\n");
}

function formatLine(line) {
  // Remove trailing whitespace
  line = line.replace(/\s+$/, "");

  // Normalize spaces around operators (but not inside strings, comments, or preprocessor directives)
  const isPreprocessor = line.startsWith("#");
  if (!isInsideString(line) && !isPreprocessor) {
    // Spacing around comparison operators
    line = line.replace(/([^!=<>])=(?!=)/g, "$1 = ");
    line = line.replace(/([^<>])=(?!=)/g, "$1 = ");
    line = line.replace(/==/g, " == ");
    line = line.replace(/!=/g, " != ");
    line = line.replace(/>=/g, " >= ");
    line = line.replace(/<=/g, " <= ");
    line = line.replace(/([^<>])>(?![>])/g, "$1 > ");
    line = line.replace(/([^<>])<(?![<])/g, "$1 < ");

    // Spacing around arithmetic operators
    line = line.replace(/([^\s+\-*/])([+\-*/])([^\s+\-*/])/g, "$1 $2 $3");

    // Remove duplicate spaces
    line = line.replace(/  +/g, " ");
  }

  // Fix spacing after keywords
  line = line.replace(/\b(if|else|for|while|switch|return|do|case)\(/g, "$1 (");
  line = line.replace(/\b(if|else|for|while|switch|return|do|case)  \(/g, "$1 (");

  // Fix spacing before opening brace
  line = line.replace(/\)\{/g, ") {");
  line = line.replace(/\)\{/g, ") {");

  // Fix spacing after semicolons in for loops
  line = line.replace(/;(\s*)/g, "; ");

  // Fix spacing around colons in case statements
  line = line.replace(/case\s+(.+?):/g, "case $1:");

  // Fix spacing in include statements
  line = line.replace(/#include\s+</g, "#include <");

  // Fix spacing in namespace
  line = line.replace(/namespace\s+/g, "namespace ");

  return line;
}

function isInsideString(line) {
  let inString = false;
  let inChar = false;
  let escape = false;

  for (const char of line) {
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"' && !inChar) {
      inString = !inString;
    }
    if (char === "'" && !inString) {
      inChar = !inChar;
    }
  }

  return inString || inChar;
}

export default formatCpp;