const createRadios = (values, { name = "" } = {}) => values.map(({ value, label }) => `
<label class="radio">
  <input type="radio" name="${name}" value="${value}">
  <i></i>
  <span>${label}</span>
</label>
`);
const createToggle = ({ label = "", name = "", checked = false } = {}) => `
<label class="toggle">
  <input name="${name}" type="checkbox" ${checked ? "checked" : ""} >
  <i></i>
  <span>${label}</span>
</label>
`;
const createRange = ({ label = "", value = "1", name = "", min = "1", max = "4" } = {}) => `
${label ? `<label>${label}</label>` : ""}
<div class="range" is="input-range">
  <input type="range" name="${name}" value="${value}" min="${min}" max="${max}">
  <output>${value}</output>
</div>
`;
/**
 * @param {{label: string, value: string}[]} values
 */
const createSelect = (values, { name = "" } = {}) => `
<div class="select">
  <select name="${name}">
  ${values.map(({ label, value }) => `<option value="${value}">${label}</option>`).join("")}
  </select>
</div>
`;

/**
 * 
 * @param {{legend?: string, type: string, name?: string, fields: { label: string, name: string, value?: any}[]}} GROUP 
 */
const setupGroupSettings = GROUP => {
  switch (GROUP.type) {
    case "toggle":
      return GROUP.fields.map(createToggle).join("");
    case "range":
      return GROUP.fields.map(createRange).join("");
    case "radio":
      return createRadios(GROUP.fields, { name: GROUP.name }).join("");
    case "select":
      return createSelect(GROUP.fields, { name: GROUP.name });
  }
};

export default setupGroupSettings;