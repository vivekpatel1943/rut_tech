import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DailyRevisionPage } from "../features/revisions/pages/DailyRevisionPage";
import { RevisionsPage } from "../features/revisions/pages/RevisionsPage";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RevisionsPage />} />
      <Route path="/daily-revision" element={<DailyRevisionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

