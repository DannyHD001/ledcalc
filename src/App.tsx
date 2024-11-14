import React, { useState } from 'react';
import { Tabs } from './components/Tabs';
import { TabPanel } from './components/TabPanel';
import { PanelSelector } from './components/PanelSelector';
import { ScreenConfig } from './components/ScreenConfig';
import { ScreenVisualization } from './components/ScreenVisualization';
import { Results } from './components/Results';
import { Panel } from './types/panel';
import { useDatabase } from './hooks/useDatabase';
import { DatabaseStatus } from './components/DatabaseStatus';

const LOGO_URL = "https://cdn.discordapp.com/attachments/1105588640484184225/1105588730984673350/Av-teknikk_Logo.png?ex=6735b17e&is=67345ffe&hm=8330e73c69709957331dac69a501c314421cc564654a79541884f556e9026c78&";

function App() {
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [horizontalPanels, setHorizontalPanels] = useState(1);
  const [verticalPanels, setVerticalPanels] = useState(1);
  const { panels, loading, error, apiStatus, savePanel, removePanel } = useDatabase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <img src={LOGO_URL} alt="AV Teknikk" className="h-16" />
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
              />
            )}
          </TabPanel>

          <TabPanel label="Results">
            {selectedPanel && (
              <Results
                panel={selectedPanel}
                horizontalPanels={horizontalPanels}
                verticalPanels={verticalPanels}
                logo={LOGO_URL}
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