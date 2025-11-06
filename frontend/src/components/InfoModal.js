import React from 'react';
import { Button } from './ui/button';

const InfoModal = ({ grain, onClose }) => {
  if (!grain) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
        <h2 className="text-2xl font-bold mb-4">
          {grain.name_en} / {grain.name_ua}
        </h2>
        <p><strong>Опис:</strong> {grain.description}</p>

        <Button
          onClick={onClose}
          className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default InfoModal;
