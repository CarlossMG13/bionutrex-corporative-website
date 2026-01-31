// Test component to verify image updates work correctly
import React from 'react';
import { useHomeSections } from "@/contexts/HomeDataContext";

export default function TestImageUpdate() {
  const { sections } = useHomeSections();
  
  console.log('Current sections with images:', sections);
  
  return (
    <div className="p-4 border border-gray-300 rounded">
      <h3 className="font-bold mb-2">Test: Current Section Images</h3>
      {sections.map(section => (
        <div key={section.id} className="mb-4 p-2 border border-gray-200 rounded">
          <h4 className="font-medium">{section.title} ({section.sectionKey})</h4>
          <div className="text-sm text-gray-600">
            Images: {section.images?.length || 0}
          </div>
          {section.images && section.images.length > 0 && (
            <div className="mt-2">
              {section.images.map((img, index) => (
                <div key={img.id} className="text-xs mb-1">
                  {index + 1}. {img.url} (alt: {img.alt})
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}