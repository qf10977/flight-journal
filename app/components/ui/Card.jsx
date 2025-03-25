"use client"

import React from 'react'

function Card({ 
  children, 
  className = "", 
  title, 
  footer,
  ...props 
}) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      {...props}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  )
}

function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`px-4 py-3 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  )
}

function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`px-4 py-3 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardContent, CardFooter }