import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, PDFViewer } from '@react-pdf/renderer';
import { Panel } from '../types/panel';
import { usePanelCalculator } from '../hooks/usePanelCalculator';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#334155',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '33%',
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
  },
  visualization: {
    marginTop: 20,
    alignItems: 'center',
  },
  visualizationImage: {
    width: '100%',
    maxWidth: 500,
    height: 'auto',
  },
});

interface PDFExportProps {
  panel: Panel;
  horizontalPanels: number;
  verticalPanels: number;
  visualizationImage?: string;
}

const PDFDocument: React.FC<PDFExportProps> = ({
  panel,
  horizontalPanels,
  verticalPanels,
  visualizationImage,
}) => {
  const calculations = usePanelCalculator(panel, horizontalPanels, verticalPanels);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            style={styles.logo}
            src="https://placehold.co/120x40?text=Your+Logo"
          />
          <Text>Generated: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>LED Screen Configuration Report</Text>

        {/* Panel Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Panel Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Panel Model</Text>
              <Text style={styles.value}>{panel.name}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Pixel Pitch</Text>
              <Text style={styles.value}>{panel.pixelPitch}mm</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Panel Size</Text>
              <Text style={styles.value}>{panel.width}x{panel.height}mm</Text>
            </View>
          </View>
        </View>

        {/* Screen Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Screen Configuration</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Total Size</Text>
              <Text style={styles.value}>
                {calculations.dimensions.width.toFixed(2)}x{calculations.dimensions.height.toFixed(2)}m
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Resolution</Text>
              <Text style={styles.value}>
                {calculations.resolution.horizontal}x{calculations.resolution.vertical}px
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Total Pixels</Text>
              <Text style={styles.value}>{calculations.totalPixels.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Physical Properties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Properties</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Total Weight</Text>
              <Text style={styles.value}>{calculations.weight.toFixed(2)}kg</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Power Consumption</Text>
              <Text style={styles.value}>{calculations.power}W</Text>
            </View>
          </View>
        </View>

        {/* Rigging Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rigging Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Single Headers</Text>
              <Text style={styles.value}>{calculations.rigging.singleHeaders}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Double Headers</Text>
              <Text style={styles.value}>{calculations.rigging.doubleHeaders}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Total Points</Text>
              <Text style={styles.value}>{calculations.rigging.totalPoints}</Text>
            </View>
          </View>
        </View>

        {/* Processing Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processing Requirements</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Controllers Needed</Text>
              <Text style={styles.value}>{calculations.controllers.needed}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Outputs Required</Text>
              <Text style={styles.value}>{calculations.controllers.outputsNeeded}</Text>
            </View>
          </View>
        </View>

        {/* Visualization */}
        {visualizationImage && (
          <View style={styles.visualization}>
            <Text style={styles.sectionTitle}>Screen Visualization</Text>
            <Image
              style={styles.visualizationImage}
              src={visualizationImage}
            />
          </View>
        )}
      </Page>
    </Document>
  );
};

export default PDFDocument;