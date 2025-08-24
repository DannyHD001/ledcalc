import { useState } from 'react';
import { Tabs } from './components/Tabs';
import { TabPanel } from './components/TabPanel';
import { PanelSelector } from './components/PanelSelector';
import { ControllerSelector } from './components/ControllerSelector';
import { ScreenConfig } from './components/ScreenConfig';
import { ScreenVisualization } from './components/ScreenVisualization';
import { Results } from './components/Results';
import { Panel } from './types/panel';
import { Controller } from './types/controller';
import { useDatabase } from './hooks/useDatabase';
import { useControllerDatabase } from './hooks/useControllerDatabase';
import { DatabaseStatus } from './components/DatabaseStatus';
import { AdminLogin } from './components/AdminLogin';
import avteknikLogo from './assets/AVTeknikkLogov2.png';

function App() {
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [selectedController, setSelectedController] = useState<Controller | null>(null);
  const [horizontalPanels, setHorizontalPanels] = useState(1);
  const [verticalPanels, setVerticalPanels] = useState(1);
  const [numberingDirection, setNumberingDirection] = useState<'left' | 'right' | 'top' | 'bottom'>('left');
  const [portStartOverrides, setPortStartOverrides] = useState<{[portNumber: number]: number | undefined}>({});
  const { panels, loading, error, savePanel, removePanel } = useDatabase();
  const { 
    controllers, 
    loading: controllerLoading, 
    error: controllerError, 
    saveController, 
    removeController 
  } = useControllerDatabase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img src={avteknikLogo} alt="AV Teknikk" className="h-16" />
          </div>
          <div className="flex items-center space-x-3">
            <DatabaseStatus />
            <AdminLogin />
          </div>
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
              
              <ControllerSelector
                controllers={controllers}
                selectedController={selectedController}
                onControllerSelect={setSelectedController}
                onSaveController={saveController}
                onDeleteController={removeController}
                loading={controllerLoading}
                error={controllerError}
              />
              
              {/* Progress hints for user */}
              {!selectedPanel && !selectedController && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                      <span className="text-blue-700 font-medium">Select a Panel</span>
                      <div className="w-4 h-px bg-blue-300"></div>
                      <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                      <span className="text-gray-500 font-medium">Select a Controller</span>
                      <div className="w-4 h-px bg-gray-300"></div>
                      <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                      <span className="text-gray-500 font-medium">Configure Screen</span>
                    </div>
                  </div>
                  <p className="text-blue-600">Start by selecting an LED panel from the options above.</p>
                </div>
              )}
              
              {selectedPanel && !selectedController && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">✓</div>
                      <span className="text-green-700 font-medium">Panel Selected</span>
                      <div className="w-4 h-px bg-green-300"></div>
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                      <span className="text-amber-700 font-medium">Select a Controller</span>
                      <div className="w-4 h-px bg-gray-300"></div>
                      <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                      <span className="text-gray-500 font-medium">Configure Screen</span>
                    </div>
                  </div>
                  <p className="text-amber-700">Great! Now select a controller to continue with screen configuration.</p>
                </div>
              )}
              
              {selectedPanel && selectedController && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">✓</div>
                      <span className="text-green-700 font-medium">Panel Selected</span>
                      <div className="w-4 h-px bg-green-400"></div>
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">✓</div>
                      <span className="text-green-700 font-medium">Controller Selected</span>
                      <div className="w-4 h-px bg-green-400"></div>
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                      <span className="text-blue-700 font-medium">Configure Screen</span>
                    </div>
                  </div>
                  <p className="text-green-700 text-sm">Perfect! Configure your screen dimensions below.</p>
                </div>
              )}
              
              {selectedPanel && selectedController && (
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
            {selectedPanel && selectedController ? (
              <ScreenVisualization
                panel={selectedPanel}
                controller={selectedController}
                horizontalPanels={horizontalPanels}
                verticalPanels={verticalPanels}
                numberingDirection={numberingDirection}
                onNumberingDirectionChange={setNumberingDirection}
                portStartOverrides={portStartOverrides}
                onPortStartOverridesChange={setPortStartOverrides}
              />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Visualization Not Available</h3>
                <p className="text-gray-500 mb-4">
                  {!selectedPanel && !selectedController 
                    ? "Please select both a panel and controller in the Configuration tab to view the screen visualization."
                    : !selectedPanel 
                    ? "Please select a panel in the Configuration tab to continue."
                    : "Please select a controller in the Configuration tab to continue."
                  }
                </p>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm">
                  → Go to Configuration Tab
                </span>
              </div>
            )}
          </TabPanel>

          <TabPanel label="Results">
            {selectedPanel && selectedController ? (
              <Results
                panel={selectedPanel}
                controller={selectedController}
                horizontalPanels={horizontalPanels}
                verticalPanels={verticalPanels}
                logo={avteknikLogo}
                numberingDirection={numberingDirection}
                onNumberingDirectionChange={setNumberingDirection}
                portStartOverrides={portStartOverrides}
                onPortStartOverridesChange={setPortStartOverrides}
              />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Results Not Available</h3>
                <p className="text-gray-500 mb-4">
                  {!selectedPanel && !selectedController 
                    ? "Please select both a panel and controller in the Configuration tab to view the calculation results."
                    : !selectedPanel 
                    ? "Please select a panel in the Configuration tab to continue."
                    : "Please select a controller in the Configuration tab to continue."
                  }
                </p>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm">
                  → Go to Configuration Tab
                </span>
              </div>
            )}
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
