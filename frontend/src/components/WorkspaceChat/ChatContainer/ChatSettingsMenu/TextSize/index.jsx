import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function TextSizeRow() {
  const { t } = useTranslation();
  const [selectedSize, setSelectedSize] = useState(
    window.localStorage.getItem("anythingllm_text_size") || "normal"
  );
  function changeSize(size) {
    setSelectedSize(size);
    window.localStorage.setItem("anythingllm_text_size", size);
    window.dispatchEvent(new CustomEvent("textSizeChange", { detail: size }));
  }
  return (
    <fieldset className="design-text-size">
      <legend>{t("chat_window.text_size_label")}</legend>
      <div>
        {["small", "normal", "large"].map((size) => (
          <label key={size}>
            <input
              type="radio"
              name="chat-text-size"
              value={size}
              checked={selectedSize === size}
              onChange={() => changeSize(size)}
            />
            <span>{t(`chat_window.${size}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
