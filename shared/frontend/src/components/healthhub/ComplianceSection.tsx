import React from 'react';
import { ComplianceFeature } from '../../hooks/healthhub/useHealthHubData';

interface ComplianceSectionProps {
  complianceFeatures: ComplianceFeature[];
}

const ComplianceCard: React.FC<{ feature: ComplianceFeature }> = ({ feature }) => {
  const getComplianceIcon = (iconName: string) => {
    switch (iconName) {
      case 'lock':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <circle cx="12" cy="16" r="1"></circle>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        );
      case 'shield':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        );
      case 'check-square':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3 8-8"></path>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.54 0 2.98.4 4.24 1.1"></path>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        );
    }
  };

  const getTypeColor = (type: ComplianceFeature['type']) => {
    switch (type) {
      case 'security':
        return 'text-blue-600 dark:text-blue-400';
      case 'certification':
        return 'text-green-600 dark:text-green-400';
      case 'regulatory':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getTypeColor(feature.type)} bg-current bg-opacity-10`}>
        <div className={getTypeColor(feature.type)}>
          {getComplianceIcon(feature.icon)}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {feature.title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export const ComplianceSection: React.FC<ComplianceSectionProps> = ({
  complianceFeatures
}) => {

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Enterprise-Grade Security & Compliance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Built for healthcare organizations requiring the highest levels of data protection 
              and regulatory compliance.
            </p>

            {/* Compliance Features */}
            <div className="space-y-4">
              {complianceFeatures.map((feature) => (
                <ComplianceCard key={feature.id} feature={feature} />
              ))}
            </div>

            {/* Additional Security Info */}
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Additional Security Measures
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  256-bit AES encryption at rest and in transit
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Multi-factor authentication (MFA) required
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Role-based access controls (RBAC)
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Comprehensive audit logging
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Regular security assessments and penetration testing
                </li>
              </ul>
            </div>
          </div>

          {/* Visual Side - Certification Badge */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Main Certification Badge */}
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 rounded-full shadow-2xl">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-full">
                  <svg className="w-16 h-16 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </div>
              </div>

              {/* Certification Text */}
              <div className="text-center mt-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Healthcare Certified
                </h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  HIPAA • SOC 2 • ISO 27001
                </p>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Support CTA */}
        <div className="mt-16 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Enterprise Healthcare Support
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Get dedicated support from our healthcare compliance experts. We help you navigate 
            regulatory requirements and implement best practices for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
              Contact Compliance Team
            </button>
            <button className="px-8 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              Download Security Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}; 