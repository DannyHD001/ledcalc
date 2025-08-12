import { useState } from 'react';
import { Tabs } from './components/Tabs';
import { TabPanel } from './components/TabPanel';
import { PanelSelector } from './components/PanelSelector';
import { ScreenConfig } from './components/ScreenConfig';
import { ScreenVisualization } from './components/ScreenVisualization';
import { Results } from './components/Results';
import { Panel } from './types/panel';
import { useDatabase } from './hooks/useDatabase';
import { DatabaseStatus } from './components/DatabaseStatus';
import avteknikLogo from './assets/avteknikk-logo.svg';

function App() {
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [horizontalPanels, setHorizontalPanels] = useState(1);
  const [verticalPanels, setVerticalPanels] = useState(1);
  const [numberingDirection, setNumberingDirection] = useState<'left' | 'right' | 'top' | 'bottom'>('left');
  const { panels, loading, error, apiStatus, savePanel, removePanel } = useDatabase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <img src={avteknikLogo} alt="AV Teknikk" className="h-16" />
        </div>
        
        <Tabs>
          <TabPanel label="Configuration">
            <div className="space-y-8">
              <PanelSelector 
                panels={panels}
                selectedPanel={selectedPanel}
                onPanelSelect={setSelectedPanel}
                onSavePanel={savePanel}
                onDeletePanel={removePanel}
                loading={loading}
                error={error}
              />
              
              {selectedPanel && (
                <ScreenConfig
                  horizontalPanels={horizontalPanels}
                  verticalPanels={verticalPanels}
                  selectedPanel={selectedPanel}
                  onHorizontalChange={setHorizontalPanels}
                  onVerticalChange={setVerticalPanels}
                />
              )}
            </div>
          </TabPanel>

          <TabPanel label="Visualization">
            {selectedPanel && (
              <ScreenVisualization
                panel={selectedPanel}
                horizontalPanels={horizontalPanels}
                verticalPanels={verticalPanels}
                numberingDirection={numberingDirection}
                onNumberingDirectionChange={setNumberingDirection}
              />
            )}
          </TabPanel>

          <TabPanel label="Results">
            {selectedPanel && (
              <Results
                panel={selectedPanel}
                horizontalPanels={horizontalPanels}
                verticalPanels={verticalPanels}
                logo={avteknikLogo}
                numberingDirection={numberingDirection}
                onNumberingDirectionChange={setNumberingDirection}
              />
            )}
          </TabPanel>
        </Tabs>
      </div>

      <DatabaseStatus status={apiStatus} error={error} />
    </div>
  );
}

export default App;
