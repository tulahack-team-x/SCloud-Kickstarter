import { useEffect, useRef } from "react";

type GuideModalProps = {
  open: boolean;
  onClose: () => void;
};

function GuideModal({ open, onClose }: GuideModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="guide-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal__head">
        <span className="eyebrow">КАК ЭТО РАБОТАЕТ</span>
        <button
          type="button"
          className="modal__close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <h2 id="guide-title">От гипотезы — к результату</h2>
      <ol className="modal__steps">
        <li>
          <strong>Выберите исследование.</strong> Изучите цель, команду и этапы.
        </li>
        <li>
          <strong>Поддержите проект.</strong> В демо-режиме взнос тестовый.
        </li>
        <li>
          <strong>Следите за ходом.</strong> Команда публикует отчёты по этапам.
        </li>
        <li>
          <strong>Получите результат.</strong> Понятное резюме и открытые
          данные.
        </li>
      </ol>
      <button type="button" className="button" onClick={onClose}>
        Понятно
      </button>
    </dialog>
  );
}

export default GuideModal;

