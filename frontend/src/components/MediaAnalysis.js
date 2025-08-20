import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Upload,
  FileText,
  Image,
  Video,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Brain,
  Zap,
  BarChart3
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MediaAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setResults(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const analyzeMedia = async (analysisType = 'standard') => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = analysisType === 'multimodal' 
        ? `${API}/media/multimodal-analyze`
        : `${API}/media/analyze`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data);
      
      // Add to history
      const historyItem = {
        id: response.data.id || Date.now(),
        filename: selectedFile.name,
        result: response.data,
        timestamp: new Date().toISOString(),
        analysisType
      };
      
      setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setResults({
        error: true,
        message: error.response?.data?.detail || 'Analysis failed'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const FileUploadArea = () => (
    <div className="cyber-card p-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-cyan-400 bg-cyan-400/5' 
            : 'border-green-400/30 hover:border-green-400/60'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-cyan-400' : 'text-green-400'}`} />
        
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-2">
          Upload Media for Analysis
        </h3>
        
        <p className="text-green-400/70 mb-6">
          Drag & drop your file here, or click to select
        </p>
        
        <div className="flex justify-center space-x-4 mb-4">
          <div className="flex items-center space-x-2 text-green-400/60">
            <Image className="w-5 h-5" />
            <span className="text-sm font-mono">Images</span>
          </div>
          <div className="flex items-center space-x-2 text-green-400/60">
            <Video className="w-5 h-5" />
            <span className="text-sm font-mono">Videos</span>
          </div>
        </div>
        
        <p className="text-green-400/50 text-sm font-mono">
          Supported: JPG, PNG, MP4, AVI, MOV
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
        />
      </div>
      
      {selectedFile && (
        <div className="mt-6 p-4 bg-black/30 rounded-lg border border-green-400/30">
          <div className="flex items-center space-x-3">
            {selectedFile.type.startsWith('image/') ? (
              <Image className="w-6 h-6 text-blue-400" />
            ) : (
              <Video className="w-6 h-6 text-purple-400" />
            )}
            <div className="flex-1">
              <p className="text-green-400 font-mono">{selectedFile.name}</p>
              <p className="text-green-400/60 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => analyzeMedia('standard')}
              disabled={analyzing}
              className="neon-btn flex-1 flex items-center justify-center space-x-2"
            >
              {analyzing ? (
                <>
                  <div className="cyber-loader w-4 h-4"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Standard Analysis</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => analyzeMedia('multimodal')}
              disabled={analyzing}
              className="neon-btn info flex-1 flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Advanced Analysis</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const AnalysisResults = () => {
    if (!results) return null;

    if (results.error) {
      return (
        <div className="cyber-card p-6 border-2 border-red-400">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <h3 className="text-xl font-semibold text-red-400 font-mono">Analysis Failed</h3>
          </div>
          <p className="text-red-400/80">{results.message}</p>
        </div>
      );
    }

    const isMultimodal = results.result && results.result.fusion_score !== undefined;
    const isAuthentic = isMultimodal 
      ? results.result.final_decision === 'authentic'
      : results.is_authentic;
    const confidence = isMultimodal 
      ? results.result.fusion_score
      : results.confidence;

    return (
      <div className="space-y-6">
        {/* Main Result */}
        <div className={`cyber-card p-6 border-2 ${isAuthentic ? 'border-green-400' : 'border-red-400'}`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className={`p-4 rounded-full ${isAuthentic ? 'bg-green-400' : 'bg-red-400'}`}>
              {isAuthentic ? (
                <CheckCircle className="w-8 h-8 text-black" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-black" />
              )}
            </div>
            <div>
              <h3 className={`text-2xl font-bold font-mono ${isAuthentic ? 'text-green-400' : 'text-red-400'}`}>
                {isAuthentic ? 'AUTHENTIC' : 'DEEPFAKE DETECTED'}
              </h3>
              <p className="text-green-400/70">
                Confidence: {(confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <BarChart3 className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-cyan-400 font-mono text-lg font-bold">
                {(confidence * 100).toFixed(1)}%
              </p>
              <p className="text-green-400/70 text-sm">Confidence Score</p>
            </div>
            
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-purple-400 font-mono text-lg font-bold">
                {results.analysis_details?.processing_time?.toFixed(2) || '2.1'}s
              </p>
              <p className="text-green-400/70 text-sm">Processing Time</p>
            </div>
            
            <div className="text-center p-4 bg-black/30 rounded-lg">
              <Eye className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-400 font-mono text-lg font-bold">
                {results.detection_method?.includes('CNN') ? 'AI' : 'Standard'}
              </p>
              <p className="text-green-400/70 text-sm">Detection Method</p>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        {isMultimodal && results.result && (
          <div className="cyber-card p-6">
            <h4 className="text-lg font-semibold text-green-400 font-mono mb-4">
              Multi-Modal Analysis Results
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.result.video_analysis && (
                <div className="p-4 bg-black/30 rounded-lg">
                  <h5 className="text-purple-400 font-mono font-semibold mb-2">Video Analysis</h5>
                  <p className="text-green-400 mb-1">
                    Confidence: {(results.result.video_analysis.confidence * 100).toFixed(1)}%
                  </p>
                  <div className="space-y-1">
                    {results.result.video_analysis.detected_manipulations?.map((manip, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-red-400/20 text-red-400 text-xs rounded mr-1">
                        {manip.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {results.result.audio_analysis && (
                <div className="p-4 bg-black/30 rounded-lg">
                  <h5 className="text-cyan-400 font-mono font-semibold mb-2">Audio Analysis</h5>
                  <p className="text-green-400 mb-1">
                    Confidence: {(results.result.audio_analysis.confidence * 100).toFixed(1)}%
                  </p>
                  <div className="space-y-1">
                    {results.result.audio_analysis.detected_manipulations?.map((manip, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-red-400/20 text-red-400 text-xs rounded mr-1">
                        {manip.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {results.result.metadata_analysis && (
                <div className="p-4 bg-black/30 rounded-lg">
                  <h5 className="text-yellow-400 font-mono font-semibold mb-2">Metadata Analysis</h5>
                  <p className="text-green-400 mb-1">
                    Suspicion: {(results.result.metadata_analysis.suspicion_score * 100).toFixed(1)}%
                  </p>
                  <div className="space-y-1">
                    {results.result.metadata_analysis.flags?.map((flag, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded mr-1">
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Face Analysis Details */}
        {results.analysis_details?.face_analysis && (
          <div className="cyber-card p-6">
            <h4 className="text-lg font-semibold text-green-400 font-mono mb-4">
              Face Analysis Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <p className="text-green-400 font-mono text-lg font-bold">
                  {results.analysis_details.face_analysis.compression_artifacts?.toFixed(3) || '0.000'}
                </p>
                <p className="text-green-400/70 text-sm">Compression Artifacts</p>
              </div>
              
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <p className="text-green-400 font-mono text-lg font-bold">
                  {results.analysis_details.face_analysis.blending_artifacts?.toFixed(3) || '0.000'}
                </p>
                <p className="text-green-400/70 text-sm">Blending Artifacts</p>
              </div>
              
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <p className="text-green-400 font-mono text-lg font-bold">
                  {results.analysis_details.face_analysis.temporal_inconsistencies?.toFixed(3) || '0.000'}
                </p>
                <p className="text-green-400/70 text-sm">Temporal Issues</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AnalysisHistory = () => (
    <div className="cyber-card p-6">
      <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Recent Analyses</h3>
      
      {analysisHistory.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
          <p className="text-green-400/70">No analysis history</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {analysisHistory.map((item) => {
            const isAuthentic = item.result.result 
              ? item.result.result.final_decision === 'authentic'
              : item.result.is_authentic;
            
            return (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg border border-green-400/20">
                <div className={`w-3 h-3 rounded-full ${isAuthentic ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-green-400 font-mono text-sm truncate">{item.filename}</p>
                  <p className="text-green-400/60 text-xs">
                    {isAuthentic ? 'Authentic' : 'Deepfake'} • {item.analysisType}
                  </p>
                </div>
                <div className="text-green-400/60 text-xs">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 space-y-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-400 font-mono mb-2">
          Media Analysis
        </h1>
        <p className="text-green-400/70 font-mono">
          Advanced AI-powered deepfake detection and multimedia analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analysis Area */}
        <div className="lg:col-span-2 space-y-6">
          <FileUploadArea />
          <AnalysisResults />
        </div>
        
        {/* Side Panel */}
        <div className="space-y-6">
          <AnalysisHistory />
        </div>
      </div>
    </div>
  );
};

export default MediaAnalysis;