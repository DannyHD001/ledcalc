import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Panel } from '../types/panel';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  logo: {
    width: 120,
    height: 40
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  column: {
    flex: 1
  },
  label: {
    fontSize: 10,
    color: '#666'
  },
  value: {
    fontSize: 12,
    marginTop: 2
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666'
  }
});

interface ResultsPDFProps {
  panel: Panel;
  calculations: any;
  horizontalPanels: number;
  verticalPanels: number;
  logo?: string;
}

export function ResultsPDF({ panel, calculations, horizontalPanels, verticalPanels, logo }: ResultsPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logo && <Image src={logo} style={styles.logo} />}
          <Text style={styles.title}>LED Screen Configuration</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Panel Information</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Model</Text>
              <Text style={styles.value}>{panel.name}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Manufacturer</Text>
              <Text style={styles.value}>{panel.manufacturer}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Screen Configuration</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Panel Layout</Text>
              <Text style={styles.value}>{horizontalPanels} × {verticalPanels} panels</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total Size</Text>
              <Text style={styles.value}>
                {calculations.dimensions.width.toFixed(2)}m × {calculations.dimensions.height.toFixed(2)}m
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Resolution</Text>
              <Text style={styles.value}>
                {calculations.resolution.horizontal.toLocaleString()} × {calculations.resolution.vertical.toLocaleString()}
              </Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total Pixels</Text>
              <Text style={styles.value}>{calculations.resolution.total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Requirements</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Total Weight</Text>
              <Text style={styles.value}>{calculations.weight.toFixed(1)} kg</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Power Consumption</Text>
              <Text style={styles.value}>{calculations.power.toFixed(0)} W</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Controllers Required</Text>
              <Text style={styles.value}>{calculations.controllers.needed}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total Ports</Text>
              <Text style={styles.value}>{calculations.controllers.totalPorts}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rigging Information</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Single Headers</Text>
              <Text style={styles.value}>{calculations.rigging.singleHeaders}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Double Headers</Text>
              <Text style={styles.value}>{calculations.rigging.doubleHeaders}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Total Attachment Points</Text>
              <Text style={styles.value}>{calculations.rigging.totalPoints}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated by AV Teknikk LED Panel Calculator • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}