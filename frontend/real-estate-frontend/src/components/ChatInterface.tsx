// frontend/src/components/ChatInterface.tsx - PHASE 4 ENHANCED
// Beautiful AI chat with property cards and external data

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Home, TrendingUp, MapPin, DollarSign } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  properties?: Property[];
  timestamp: Date;
}

interface Property {
  region_id: number;
  region_name: string;
  state_name: string;
  current_value?: number;
  median_list_price?: number;
  heat_index?: number;
  inventory?: number;
  external_data?: ExternalData;
}

interface ExternalData {
  redfin?: {
    median_sale_price: number;
    median_dom: number;
    inventory: number;
    homes_sold: number;
  };
  crime?: {
    violent_crime: number;
    property_crime: number;
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI real estate assistant. I can help you find properties, analyze markets, and answer questions. What are you looking for?',
      suggestions: [
        'Houses in California under $600k',
        'What are the hottest markets?',
        'Affordable family neighborhoods'
      ],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call RAG endpoint
      const response = await fetch('http://localhost:3000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      // Parse response for properties
      const properties = await extractProperties(data.message);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        suggestions: data.suggestions,
        properties,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const extractProperties = async (message: string): Promise<Property[] | undefined> => {
    // Extract region IDs from message (format: /regions/123)
    const regex = /\/regions\/(\d+)/g;
    const matches = [...message.matchAll(regex)];
    
    if (matches.length === 0) return undefined;

    const properties: Property[] = [];

    for (const match of matches) {
      const regionId = match[1];
      
      try {
        // Fetch property details
        const response = await fetch(`http://localhost:3000/api/v1/regions/${regionId}`);
        const property = await response.json();

        // Fetch external data
        try {
          const externalResponse = await fetch('http://localhost:8000/external/combined', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              region_name: property.region_name,
              state: property.state_name
            })
          });

          const externalData = await externalResponse.json();
          property.external_data = externalData.data;
        } catch (e) {
          console.warn('External data unavailable');
        }

        properties.push(property);
      } catch (error) {
        console.error(`Failed to fetch region ${regionId}:`, error);
      }
    }

    return properties.length > 0 ? properties : undefined;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Home className="text-blue-600" />
          AI Real Estate Agent
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Powered by semantic search, RAG, and real-time market data
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              } rounded-2xl px-6 py-4 shadow-sm`}
            >
              {/* Message Content */}
              <div className="prose prose-sm max-w-none">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className={message.role === 'user' ? 'text-white' : 'text-gray-800'}>
                    {line}
                  </p>
                ))}
              </div>

              {/* Property Cards */}
              {message.properties && message.properties.length > 0 && (
                <div className="mt-4 space-y-3">
                  {message.properties.map((property) => (
                    <PropertyCard key={property.region_id} property={property} />
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(suggestion)}
                      className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage(input)}
            placeholder="Ask me about properties, markets, or neighborhoods..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Property Card Component
function PropertyCard({ property }: { property: Property }) {
  const { external_data } = property;
  const redfin = external_data?.redfin;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {property.region_name}, {property.state_name}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            Region ID: {property.region_id}
          </p>
        </div>
        {property.heat_index && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            Heat: {property.heat_index.toFixed(1)}
          </div>
        )}
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Internal Price */}
        {property.current_value && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium mb-1">Internal DB</div>
            <div className="text-lg font-bold text-blue-900">
              ${property.current_value.toLocaleString()}
            </div>
          </div>
        )}

        {/* Redfin Price */}
        {redfin?.median_sale_price && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-600 font-medium mb-1">Redfin Market</div>
            <div className="text-lg font-bold text-green-900">
              ${redfin.median_sale_price.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Market Stats */}
      {redfin && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-gray-100 rounded p-2">
            <div className="text-gray-600">Days on Market</div>
            <div className="font-semibold text-gray-900">{redfin.median_dom} days</div>
          </div>
          <div className="bg-gray-100 rounded p-2">
            <div className="text-gray-600">Inventory</div>
            <div className="font-semibold text-gray-900">{redfin.inventory?.toLocaleString()}</div>
          </div>
          <div className="bg-gray-100 rounded p-2">
            <div className="text-gray-600">Homes Sold</div>
            <div className="font-semibold text-gray-900">{redfin.homes_sold}</div>
          </div>
        </div>
      )}

      {/* View Details Link */}
      <a
        href={`/regions/${property.region_id}`}
        className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        View Full Details →
      </a>
    </div>
  );
}