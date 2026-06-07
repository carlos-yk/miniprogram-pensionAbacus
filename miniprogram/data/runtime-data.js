module.exports = {
  "cityParams": {
    "schemaVersion": "1.0",
    "paramVersion": "2026.05.28-shanghai-2000-2025",
    "lastUpdated": "2026-05-28",
    "description": "当前可用城市参数快照。历史计算请优先使用 city-history-params.json。",
    "currentYear": 2025,
    "cities": {
      "shanghai": {
        "name": "上海",
        "currentParamRef": {
          "file": "city-history-params.json",
          "city": "shanghai",
          "year": 2025
        },
        "status": "ready",
        "paramVersion": "2026.05.28-shanghai-2000-2025",
        "publicSupportedYearRange": {
          "from": 2015,
          "to": 2025
        },
        "statusNotes": "公开测算支持已完成复核的 2015-2025 缴费年度；提交时按本次已缴年限检查是否触达仍在核对的早年参数。"
      },
      "beijing": {
        "name": "北京",
        "currentParamRef": {
          "file": "city-history-params.json",
          "city": "beijing",
          "year": 2025
        },
        "status": "partial_pending_second_review"
      },
      "shenzhen": {
        "name": "深圳",
        "currentParamRef": {
          "file": "city-history-params.json",
          "city": "shenzhen",
          "year": 2025
        },
        "status": "partial_pending_city_applicability_review"
      }
    }
  },
  "cityHistoryParams": {
    "schemaVersion": "1.0",
    "paramVersion": "2026.05.28-shanghai-2000-2025",
    "lastUpdated": "2026-05-28",
    "targetCities": [
      "shanghai",
      "beijing",
      "shenzhen"
    ],
    "canonical": true,
    "notes": [
      "上海 2000-2025 城镇职工养老保险关键参数已归并进正式历史参数。",
      "2000-2013 已有关键参数来源待二次复核；2014、2015-2025 个人账户记账利率已补入公开来源并完成本轮复核。",
      "2005 年 2006-01-01 至 2006-03-31 个人账户划入比例仍需二次复核，当前按可用政策线索显式标记为 partial。",
      "历史年度参数必须逐年使用，不允许静默使用最新年份参数替代历史年份。",
      "深圳缴费基数使用广东省2025通知作为来源线索，仍需二次复核深圳适用性。"
    ],
    "cities": {
      "shanghai": {
        "name": "上海",
        "yearlyParams": [
          {
            "year": 2000,
            "periodLabel": "2000年度，2000-04-01至2001-03-31社保缴费基数口径",
            "effectiveFrom": "2000-04-01",
            "effectiveTo": "2001-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 1179,
              "unit": "CNY/month",
              "period": "1999年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-1999-regulation-repost"
              ],
              "quality": "official_notice_repost_pending_second_review"
            },
            "pensionCalculationBase": {
              "value": 1179,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-1999-regulation-repost",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_notice_repost_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 707,
                "ceiling": 3537,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-1999-regulation-repost",
                  "shanghai-pension-account-rule-1998-official"
                ],
                "quality": "derived_from_official_wage_pending_standard_source_review"
              },
              "flexible": {
                "floor": 707,
                "ceiling": 3537,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-1999-regulation-repost",
                  "shanghai-pension-account-rule-1998-official"
                ],
                "quality": "derived_from_official_wage_pending_standard_source_review"
              }
            },
            "rates": {
              "employeePersonalRate": 0.07,
              "employerRate": 0.225,
              "employerRateSegments": [
                {
                  "effectiveFrom": "2000-04-01",
                  "effectiveTo": "2000-11-30",
                  "employerRate": 0.255,
                  "sourceIds": [
                    "shanghai-employer-rate-adjustment-2000-official"
                  ],
                  "quality": "official_municipal_notice_production_ready"
                },
                {
                  "effectiveFrom": "2000-12-01",
                  "effectiveTo": "2001-03-31",
                  "employerRate": 0.225,
                  "sourceIds": [
                    "shanghai-employer-rate-adjustment-2000-official"
                  ],
                  "quality": "official_municipal_notice_production_ready"
                }
              ],
              "personalAccountCreditRate": 0.11,
              "sourceIds": [
                "shanghai-pension-rate-adjustment-2003-policy-repost",
                "shanghai-pension-account-rule-1998-official",
                "shanghai-employer-rate-adjustment-2000-official"
              ],
              "quality": "official_municipal_notice_and_account_rule_production_ready_pending_other_fields"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "accountInterestRate",
                "平均工资原始官方页面URL",
                "社保缴费标准原始官方页面URL"
              ],
              "reviewStatus": "pending_review"
            }
          },
          {
            "year": 2001,
            "periodLabel": "2001年度，2001-04-01至2002-03-31社保缴费基数口径",
            "effectiveFrom": "2001-04-01",
            "effectiveTo": "2002-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 1285,
              "unit": "CNY/month",
              "period": "2000年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2000-regulation-repost"
              ],
              "quality": "official_notice_repost_pending_second_review"
            },
            "pensionCalculationBase": {
              "value": 1285,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2000-regulation-repost",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_notice_repost_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 771,
                "ceiling": 3855,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2000-regulation-repost"
                ],
                "quality": "derived_from_official_wage_pending_standard_source_review"
              },
              "flexible": {
                "floor": 771,
                "ceiling": 3855,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2000-regulation-repost"
                ],
                "quality": "derived_from_official_wage_pending_standard_source_review"
              }
            },
            "rates": {
              "employeePersonalRate": 0.07,
              "employerRate": 0.225,
              "personalAccountCreditRate": 0.11,
              "sourceIds": [
                "shanghai-pension-rate-adjustment-2003-policy-repost",
                "shanghai-pension-rate-adjustment-2004-policy-repost",
                "shanghai-pension-account-rule-1998-official"
              ],
              "quality": "official_account_rule_and_policy_repost_pending_rate_original_url"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "accountInterestRate",
                "平均工资原始官方页面URL",
                "社保缴费标准原始官方页面URL",
                "养老保险费率原始官方页面URL"
              ],
              "reviewStatus": "pending_review"
            }
          },
          {
            "year": 2002,
            "periodLabel": "2002年度，2002-04-01至2003-03-31社保缴费基数口径",
            "effectiveFrom": "2002-04-01",
            "effectiveTo": "2003-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 1480,
              "unit": "CNY/month",
              "period": "2001年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2001-regulation-repost"
              ],
              "quality": "official_notice_repost_pending_second_review"
            },
            "pensionCalculationBase": {
              "value": 1480,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2001-regulation-repost",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_notice_repost_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 888,
                "ceiling": 4440,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2001-regulation-repost"
                ],
                "quality": "derived_from_official_wage_pending_standard_source_review"
              },
              "flexible": {
                "floor": 888,
                "ceiling": 4440,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2001-regulation-repost"
                ],
                "quality": "derived_from_official_wage_pending_standard_source_review"
              }
            },
            "rates": {
              "employeePersonalRate": 0.07,
              "employerRate": 0.225,
              "personalAccountCreditRate": 0.11,
              "sourceIds": [
                "shanghai-pension-rate-adjustment-2003-policy-repost",
                "shanghai-pension-rate-adjustment-2004-policy-repost",
                "shanghai-pension-account-rule-1998-official"
              ],
              "quality": "official_account_rule_and_policy_repost_pending_rate_original_url"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "accountInterestRate",
                "平均工资原始官方页面URL",
                "社保缴费标准原始官方页面URL",
                "养老保险费率原始官方页面URL"
              ],
              "reviewStatus": "pending_review"
            }
          },
          {
            "year": 2003,
            "periodLabel": "2003年度，2003-04-01至2004-03-31社保缴费基数口径",
            "effectiveFrom": "2003-04-01",
            "effectiveTo": "2004-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 1623,
              "unit": "CNY/month",
              "period": "2002年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2002-regulation-repost"
              ],
              "quality": "official_notice_repost_pending_second_review"
            },
            "pensionCalculationBase": {
              "value": 1623,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2002-regulation-repost",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_notice_repost_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 974,
                "ceiling": 4869,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2003-public-report"
                ],
                "quality": "public_document_cross_checked_production_ready_pending_original_url"
              },
              "flexible": {
                "floor": 974,
                "ceiling": 4869,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2003-public-report"
                ],
                "quality": "public_document_cross_checked_production_ready_pending_original_url"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.225,
              "personalAccountCreditRate": 0.11,
              "sourceIds": [
                "shanghai-social-insurance-standard-2003-public-report",
                "shanghai-pension-rate-adjustment-2003-policy-repost",
                "shanghai-pension-rate-adjustment-2004-policy-repost"
              ],
              "quality": "public_document_policy_repost_cross_checked_pending_original_url",
              "employeePersonalRateSegments": [
                {
                  "effectiveFrom": "2003-04-01",
                  "effectiveTo": "2003-07-31",
                  "employeePersonalRate": 0.07,
                  "sourceIds": [
                    "shanghai-pension-rate-adjustment-2003-policy-repost",
                    "shanghai-social-insurance-standard-2003-public-report"
                  ],
                  "quality": "policy_repost_cross_checked_production_ready_pending_original_url"
                },
                {
                  "effectiveFrom": "2003-08-01",
                  "effectiveTo": "2004-03-31",
                  "employeePersonalRate": 0.08,
                  "sourceIds": [
                    "shanghai-pension-rate-adjustment-2003-policy-repost",
                    "shanghai-social-insurance-standard-2003-public-report"
                  ],
                  "quality": "policy_repost_cross_checked_production_ready_pending_original_url"
                }
              ]
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "accountInterestRate",
                "平均工资原始官方页面URL",
                "社保缴费标准原始官方页面URL",
                "养老保险费率原始官方页面URL"
              ],
              "reviewStatus": "pending_review"
            }
          },
          {
            "year": 2004,
            "periodLabel": "2004年度，2004-04-01至2005-03-31社保缴费基数口径",
            "effectiveFrom": "2004-04-01",
            "effectiveTo": "2005-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 1847,
              "unit": "CNY/month",
              "period": "2003年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2003-regulation-repost"
              ],
              "quality": "official_notice_repost_pending_second_review"
            },
            "pensionCalculationBase": {
              "value": 1847,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2003-regulation-repost",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_notice_repost_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 1108,
                "ceiling": 5541,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2003-regulation-repost",
                  "shanghai-social-insurance-base-2004-public-notice",
                  "shanghai-social-insurance-standard-2004-public-report"
                ],
                "quality": "official_district_repost_and_public_document_production_ready_pending_original_url"
              },
              "flexible": {
                "floor": 1108,
                "ceiling": 5541,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2003-regulation-repost",
                  "shanghai-social-insurance-base-2004-public-notice",
                  "shanghai-social-insurance-standard-2004-public-report"
                ],
                "quality": "official_district_repost_and_public_document_production_ready_pending_original_url"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.225,
              "employerRateSegments": [
                {
                  "effectiveFrom": "2004-04-01",
                  "effectiveTo": "2004-07-31",
                  "employerRate": 0.225,
                  "sourceIds": [
                    "shanghai-pension-rate-adjustment-2004-policy-repost"
                  ],
                  "quality": "official_municipal_policy_production_ready"
                },
                {
                  "effectiveFrom": "2004-08-01",
                  "effectiveTo": "2005-03-31",
                  "employerRate": 0.22,
                  "sourceIds": [
                    "shanghai-pension-rate-adjustment-2004-policy-repost"
                  ],
                  "quality": "official_municipal_policy_production_ready"
                }
              ],
              "personalAccountCreditRate": 0.11,
              "sourceIds": [
                "shanghai-social-insurance-standard-2004-public-report",
                "shanghai-pension-rate-adjustment-2003-policy-repost",
                "shanghai-pension-rate-adjustment-2004-policy-repost"
              ],
              "quality": "official_policy_segments_and_public_document_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "平均工资原始官方页面URL",
                "社保缴费标准原始官方页面URL"
              ],
              "reviewStatus": "pending_review"
            },
            "accountInterestRate": {
              "value": 0.0198,
              "unit": "annual_rate",
              "period": "2004年度",
              "sourceIds": [
                "shanghai-account-interest-rate-2004"
              ],
              "quality": "preserved_official_policy_repost_production_ready"
            }
          },
          {
            "year": 2005,
            "periodLabel": "2005年度，2005-04-01至2006-03-31社保缴费基数口径",
            "effectiveFrom": "2005-04-01",
            "effectiveTo": "2006-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 2033,
              "unit": "CNY/month",
              "period": "2004年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2004-regulation-repost"
              ],
              "quality": "official_notice_repost_production_ready_pending_original_url"
            },
            "pensionCalculationBase": {
              "value": 2033,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2004-regulation-repost",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_notice_repost_production_ready_pending_original_url"
            },
            "contributionBase": {
              "employee": {
                "floor": 1220,
                "ceiling": 6099,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2004-regulation-repost",
                  "shanghai-social-insurance-standard-2005-public-report"
                ],
                "quality": "official_notice_repost_and_public_report_production_ready_pending_original_url"
              },
              "flexible": {
                "floor": 1220,
                "ceiling": 6099,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2004-regulation-repost",
                  "shanghai-social-insurance-standard-2005-public-report"
                ],
                "quality": "official_notice_repost_and_public_report_production_ready_pending_original_url"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.22,
              "personalAccountCreditRate": 0.11,
              "sourceIds": [
                "shanghai-social-insurance-standard-2005-public-report",
                "national-enterprise-pension-system-2005",
                "shanghai-pension-rate-adjustment-2003-policy-repost",
                "shanghai-pension-rate-adjustment-2004-policy-repost"
              ],
              "quality": "public_report_policy_repost_and_transition_rule_cross_checked_pending_rate_original_url",
              "personalAccountCreditRateSegments": [
                {
                  "effectiveFrom": "2005-04-01",
                  "effectiveTo": "2005-12-31",
                  "personalAccountCreditRate": 0.11,
                  "sourceIds": [
                    "shanghai-pension-rate-adjustment-2003-policy-repost"
                  ],
                  "quality": "policy_repost_cross_checked_production_ready_pending_original_rate_url"
                },
                {
                  "effectiveFrom": "2006-01-01",
                  "effectiveTo": "2006-03-31",
                  "personalAccountCreditRate": 0.08,
                  "sourceIds": [
                    "national-enterprise-pension-system-2005"
                  ],
                  "quality": "national_policy_production_ready"
                }
              ]
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "accountInterestRate",
                "平均工资原始官方页面URL",
                "社保缴费标准原始官方页面URL",
                "养老保险费率原始官方页面URL"
              ],
              "reviewStatus": "pending_review"
            }
          },
          {
            "year": 2006,
            "periodLabel": "2006年度，2006-04-01至2007-03-31社保缴费基数口径",
            "effectiveFrom": "2006-04-01",
            "effectiveTo": "2007-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 2235,
              "unit": "CNY/month",
              "period": "2005年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2005-public-report"
              ],
              "quality": "public_report_pending_second_review"
            },
            "pensionCalculationBase": {
              "value": 2235,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2005-public-report",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_public_report_wage_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 1341,
                "ceiling": 6705,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2005-public-report"
                ],
                "quality": "derived_from_official_wage_production_ready"
              },
              "flexible": {
                "floor": 1341,
                "ceiling": 6705,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2005-public-report"
                ],
                "quality": "derived_from_official_wage_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.22,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-pension-rate-adjustment-2004-policy-repost",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "official_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "accountInterestRate"
              ],
              "reviewStatus": "pending_review"
            }
          },
          {
            "year": 2007,
            "periodLabel": "2007年度，2007-04-01至2008-03-31社保缴费基数口径",
            "effectiveFrom": "2007-04-01",
            "effectiveTo": "2008-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 2464,
              "unit": "CNY/month",
              "period": "2006年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2006"
              ],
              "quality": "official_statistics_pending_second_review"
            },
            "pensionCalculationBase": {
              "value": 2464,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2006",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 1478,
                "ceiling": 7392,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2006"
                ],
                "quality": "derived_from_official_wage_production_ready"
              },
              "flexible": {
                "floor": 1478,
                "ceiling": 7392,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2006"
                ],
                "quality": "derived_from_official_wage_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.22,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-pension-rate-adjustment-2004-policy-repost",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "official_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "accountInterestRate"
              ],
              "reviewStatus": "pending_review"
            }
          },
          {
            "year": 2008,
            "periodLabel": "2008年度，2008-04-01至2009-03-31社保缴费基数口径",
            "effectiveFrom": "2008-04-01",
            "effectiveTo": "2009-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 2892,
              "unit": "CNY/month",
              "period": "2007年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2007"
              ],
              "quality": "official_wage_source_production_ready"
            },
            "pensionCalculationBase": {
              "value": 2892,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2007",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 1735,
                "ceiling": 8676,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2007"
                ],
                "quality": "derived_from_official_wage_production_ready"
              },
              "flexible": {
                "floor": 1735,
                "ceiling": 8676,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2007"
                ],
                "quality": "derived_from_official_wage_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.22,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-pension-rate-adjustment-2004-policy-repost",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "official_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0414,
              "unit": "annual_rate",
              "period": "2008年度",
              "sourceIds": [
                "shanghai-account-interest-rate-2008"
              ],
              "quality": "preserved_official_policy_repost_production_ready"
            }
          },
          {
            "year": 2009,
            "periodLabel": "2009年度，2009-04-01至2010-03-31社保缴费基数口径",
            "effectiveFrom": "2009-04-01",
            "effectiveTo": "2010-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 3292,
              "unit": "CNY/month",
              "period": "2008年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2008"
              ],
              "quality": "official_wage_source_production_ready"
            },
            "pensionCalculationBase": {
              "value": 3292,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2008",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 1975,
                "ceiling": 9876,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2008"
                ],
                "quality": "derived_from_official_wage_production_ready"
              },
              "flexible": {
                "floor": 1975,
                "ceiling": 9876,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-average-wage-2008"
                ],
                "quality": "derived_from_official_wage_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.22,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-pension-rate-adjustment-2004-policy-repost",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "official_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0225,
              "unit": "annual_rate",
              "period": "2009年度",
              "sourceIds": [
                "shanghai-account-interest-rate-2009"
              ],
              "quality": "preserved_official_policy_repost_production_ready"
            }
          },
          {
            "year": 2010,
            "periodLabel": "2010年度，2010-04-01至2011-03-31社保缴费基数口径",
            "effectiveFrom": "2010-04-01",
            "effectiveTo": "2011-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 3566,
              "unit": "CNY/month",
              "period": "2009年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2009"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 3566,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2009",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 2140,
                "ceiling": 10698,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2010"
                ],
                "quality": "official_local_standard_production_ready"
              },
              "flexible": {
                "floor": 2140,
                "ceiling": 10698,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2010"
                ],
                "quality": "official_local_standard_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.22,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-social-insurance-standard-2010",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "national_policy_and_local_standard_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0225,
              "unit": "annual_rate",
              "period": "2010年度",
              "sourceIds": [
                "shanghai-account-interest-rate-2010"
              ],
              "quality": "preserved_official_policy_repost_production_ready"
            }
          },
          {
            "year": 2011,
            "periodLabel": "2011年度，2011-04-01至2012-03-31社保缴费基数口径",
            "effectiveFrom": "2011-04-01",
            "effectiveTo": "2012-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 3896,
              "unit": "CNY/month",
              "period": "2010年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2010"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 3896,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2010",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 2338,
                "ceiling": 11688,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2011-april-public-report",
                  "shanghai-social-insurance-standard-2011"
                ],
                "quality": "official_standard_and_public_report_production_ready"
              },
              "flexible": {
                "floor": 2338,
                "ceiling": 11688,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2011-april-public-report",
                  "shanghai-social-insurance-standard-2011"
                ],
                "quality": "official_standard_and_public_report_production_ready"
              },
              "employeeSegments": [
                {
                  "effectiveFrom": "2011-04-01",
                  "effectiveTo": "2011-06-30",
                  "floor": 2338,
                  "ceiling": 11688,
                  "sourceIds": [
                    "shanghai-social-insurance-standard-2011-april-public-report"
                  ],
                  "quality": "public_report_cross_checked_with_official_wage_production_ready"
                },
                {
                  "effectiveFrom": "2011-07-01",
                  "effectiveTo": "2012-03-31",
                  "floor": 2338,
                  "ceiling": 11688,
                  "sourceIds": [
                    "shanghai-social-insurance-standard-2011"
                  ],
                  "quality": "official_local_standard_production_ready"
                }
              ],
              "flexibleSegments": [
                {
                  "effectiveFrom": "2011-04-01",
                  "effectiveTo": "2011-06-30",
                  "floor": 2338,
                  "ceiling": 11688,
                  "sourceIds": [
                    "shanghai-social-insurance-standard-2011-april-public-report"
                  ],
                  "quality": "public_report_cross_checked_with_official_wage_production_ready"
                },
                {
                  "effectiveFrom": "2011-07-01",
                  "effectiveTo": "2012-03-31",
                  "floor": 2338,
                  "ceiling": 11688,
                  "sourceIds": [
                    "shanghai-social-insurance-standard-2011"
                  ],
                  "quality": "official_local_standard_production_ready"
                }
              ]
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.22,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-social-insurance-standard-2011-april-public-report",
                "shanghai-social-insurance-standard-2011",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "national_policy_official_standard_and_public_report_production_ready"
            },
            "dataQuality": {
              "level": "complete",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0275,
              "unit": "annual_rate",
              "period": "2011年度",
              "sourceIds": [
                "shanghai-account-interest-rate-2011-rights-record-report"
              ],
              "quality": "public_report_cross_checked_production_ready_pending_original_notice"
            }
          },
          {
            "year": 2012,
            "periodLabel": "2012年度，2012-04-01至2013-03-31社保缴费基数口径",
            "effectiveFrom": "2012-04-01",
            "effectiveTo": "2013-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 4331,
              "unit": "CNY/month",
              "period": "2011年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2011"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 4331,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2011",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 2599,
                "ceiling": 12993,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2012"
                ],
                "quality": "official_local_standard_production_ready"
              },
              "flexible": {
                "floor": 2599,
                "ceiling": 12993,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2012"
                ],
                "quality": "official_local_standard_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.22,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-social-insurance-standard-2012",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "national_policy_and_local_standard_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.035,
              "unit": "annual_rate",
              "period": "2012年度",
              "sourceIds": [
                "shanghai-account-interest-rate-2012"
              ],
              "quality": "preserved_official_policy_repost_production_ready"
            }
          },
          {
            "year": 2013,
            "periodLabel": "2013年度，2013-04-01至2014-03-31社保缴费基数口径",
            "effectiveFrom": "2013-04-01",
            "effectiveTo": "2014-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 4692,
              "unit": "CNY/month",
              "period": "2012年度",
              "label": "全市职工月平均工资",
              "sourceIds": [
                "shanghai-average-wage-2012"
              ],
              "quality": "official_pending_second_review"
            },
            "pensionCalculationBase": {
              "value": 4692,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2012",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 2815,
                "ceiling": 14076,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2013"
                ],
                "quality": "official_pending_second_review"
              },
              "flexible": {
                "floor": 2815,
                "ceiling": 14076,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2013"
                ],
                "quality": "official_pending_second_review"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.21,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-social-insurance-standard-2013",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "historical_local_rate_pending_second_review"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "accountInterestRate"
              ],
              "reviewStatus": "pending_review"
            }
          },
          {
            "year": 2014,
            "periodLabel": "2014年度，2014-04-01至2015-03-31社保缴费基数口径",
            "effectiveFrom": "2014-04-01",
            "effectiveTo": "2015-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 5036,
              "unit": "CNY/month",
              "period": "2013年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-social-insurance-standard-2014"
              ],
              "quality": "public_report_cross_checked_production_ready"
            },
            "pensionCalculationBase": {
              "value": 5036,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-social-insurance-standard-2014",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_public_report_cross_checked_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 3022,
                "ceiling": 15108,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2014"
                ],
                "quality": "public_report_cross_checked_production_ready"
              },
              "flexible": {
                "floor": 3022,
                "ceiling": 15108,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2014"
                ],
                "quality": "public_report_cross_checked_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.21,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-social-insurance-standard-2014",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "public_report_cross_checked_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0425,
              "unit": "annual_rate",
              "period": "2014年度",
              "sourceIds": [
                "shanghai-account-interest-rate-2014-public-report"
              ],
              "quality": "public_report_cross_checked_production_ready_pending_original_notice"
            }
          },
          {
            "year": 2015,
            "periodLabel": "2015年度，2015-04-01至2016-03-31社保缴费基数口径",
            "effectiveFrom": "2015-04-01",
            "effectiveTo": "2016-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 5451,
              "unit": "CNY/month",
              "period": "2014年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-social-insurance-standard-2015-public-report"
              ],
              "quality": "official_image_repost_cross_checked_production_ready"
            },
            "pensionCalculationBase": {
              "value": 5451,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-social-insurance-standard-2015-public-report",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_image_repost_cross_checked_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 3271,
                "ceiling": 16353,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2015-public-report"
                ],
                "quality": "official_image_repost_cross_checked_production_ready"
              },
              "flexible": {
                "floor": 3271,
                "ceiling": 16353,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2015-public-report"
                ],
                "quality": "official_image_repost_cross_checked_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.21,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-social-insurance-standard-2015-public-report",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "official_image_repost_cross_checked_and_national_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0275,
              "unit": "annual_rate",
              "period": "2015年度",
              "sourceIds": [
                "shanghai-account-interest-rate-2015"
              ],
              "quality": "preserved_official_policy_repost_production_ready"
            }
          },
          {
            "year": 2016,
            "periodLabel": "2016年度，2016-04-01至2017-03-31社保缴费基数口径",
            "effectiveFrom": "2016-04-01",
            "effectiveTo": "2017-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 5939,
              "unit": "CNY/month",
              "period": "2015年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-social-insurance-standard-2016"
              ],
              "quality": "derived_from_official_base_production_ready"
            },
            "pensionCalculationBase": {
              "value": 5939,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-social-insurance-standard-2016",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_base_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 3563,
                "ceiling": 17817,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2016"
                ],
                "quality": "official_local_standard_production_ready"
              },
              "flexible": {
                "floor": 3563,
                "ceiling": 17817,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2016"
                ],
                "quality": "official_local_standard_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.2,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-social-insurance-standard-2016",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "official_local_standard_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0831,
              "unit": "annual_rate",
              "period": "2016年度",
              "sourceIds": [
                "national-account-interest-rate-2016"
              ],
              "quality": "official_production_ready"
            }
          },
          {
            "year": 2017,
            "periodLabel": "2017年度，2017-04-01至2018-03-31社保缴费基数口径",
            "effectiveFrom": "2017-04-01",
            "effectiveTo": "2018-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 6504,
              "unit": "CNY/month",
              "period": "2016年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-social-insurance-base-2017-hrss-report"
              ],
              "quality": "hrss_reported_production_ready"
            },
            "pensionCalculationBase": {
              "value": 6504,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-social-insurance-base-2017-hrss-report",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_hrss_reported_base_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 3902,
                "ceiling": 19512,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2017-hrss-report"
                ],
                "quality": "hrss_reported_production_ready"
              },
              "flexible": {
                "floor": 3902,
                "ceiling": 19512,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2017-hrss-report"
                ],
                "quality": "hrss_reported_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.2,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-social-insurance-base-2017-hrss-report",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "national_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0712,
              "unit": "annual_rate",
              "period": "2017年度",
              "sourceIds": [
                "national-account-interest-rate-2017"
              ],
              "quality": "official_production_ready"
            }
          },
          {
            "year": 2018,
            "periodLabel": "2018年度，2018-04-01至2019-03-31社保缴费基数口径",
            "effectiveFrom": "2018-04-01",
            "effectiveTo": "2019-03-31",
            "currency": "CNY",
            "averageWage": {
              "value": 7132,
              "unit": "CNY/month",
              "period": "2017年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-social-insurance-standard-2018"
              ],
              "quality": "derived_from_official_base_production_ready"
            },
            "pensionCalculationBase": {
              "value": 7132,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-social-insurance-standard-2018",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_base_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 4279,
                "ceiling": 21396,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2018"
                ],
                "quality": "official_local_standard_production_ready"
              },
              "flexible": {
                "floor": 4279,
                "ceiling": 21396,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-standard-2018"
                ],
                "quality": "official_local_standard_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.2,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "shanghai-social-insurance-standard-2018",
                "national-enterprise-pension-system-2005"
              ],
              "quality": "official_local_standard_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0829,
              "unit": "annual_rate",
              "period": "2018年度",
              "sourceIds": [
                "national-account-interest-rate-2018"
              ],
              "quality": "official_production_ready"
            }
          },
          {
            "year": 2019,
            "periodLabel": "2019年度，2019-05-01至2020-06-30社保缴费基数口径",
            "effectiveFrom": "2019-05-01",
            "effectiveTo": "2020-06-30",
            "currency": "CNY",
            "averageWage": {
              "value": 8211,
              "unit": "CNY/month",
              "period": "2018年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-social-insurance-base-2019"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 8211,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-social-insurance-base-2019",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 4927,
                "ceiling": 24633,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2019"
                ],
                "quality": "official_production_ready"
              },
              "flexible": {
                "floor": 4927,
                "ceiling": 24633,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2019"
                ],
                "quality": "official_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.16,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "national-enterprise-pension-system-2005",
                "national-social-insurance-rate-2019"
              ],
              "quality": "national_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0761,
              "unit": "annual_rate",
              "period": "2019年度",
              "sourceIds": [
                "national-account-interest-rate-2019"
              ],
              "quality": "official_production_ready"
            }
          },
          {
            "year": 2020,
            "periodLabel": "2020年度，2020-07-01至2021-06-30社保缴费基数口径",
            "effectiveFrom": "2020-07-01",
            "effectiveTo": "2021-06-30",
            "currency": "CNY",
            "averageWage": {
              "value": 9339,
              "unit": "CNY/month",
              "period": "2019年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-contribution-base-2020"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 9339,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-contribution-base-2020",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 4927,
                "ceiling": 28017,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-contribution-base-2020"
                ],
                "quality": "official_production_ready"
              },
              "flexible": {
                "floor": 4927,
                "ceiling": 28017,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-contribution-base-2020"
                ],
                "quality": "official_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.16,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "national-enterprise-pension-system-2005",
                "national-social-insurance-rate-2019"
              ],
              "quality": "national_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0604,
              "unit": "annual_rate",
              "period": "2020年度",
              "sourceIds": [
                "national-account-interest-rate-2020"
              ],
              "quality": "official_production_ready"
            }
          },
          {
            "year": 2021,
            "periodLabel": "2021年度，2021-07-01至2022-06-30社保缴费基数口径",
            "effectiveFrom": "2021-07-01",
            "effectiveTo": "2022-06-30",
            "currency": "CNY",
            "averageWage": {
              "value": 10338,
              "unit": "CNY/month",
              "period": "2020年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-contribution-base-2021"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 10338,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-contribution-base-2021",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 5975,
                "ceiling": 31014,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-contribution-base-2021"
                ],
                "quality": "official_production_ready"
              },
              "flexible": {
                "floor": 5975,
                "ceiling": 31014,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-contribution-base-2021"
                ],
                "quality": "official_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.16,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "national-enterprise-pension-system-2005",
                "national-social-insurance-rate-2019"
              ],
              "quality": "national_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0669,
              "unit": "annual_rate",
              "period": "2021年度",
              "sourceIds": [
                "national-account-interest-rate-2021"
              ],
              "quality": "official_production_ready"
            }
          },
          {
            "year": 2022,
            "periodLabel": "2022年度，2022-07-01至2023-06-30社保缴费基数口径",
            "effectiveFrom": "2022-07-01",
            "effectiveTo": "2023-06-30",
            "currency": "CNY",
            "averageWage": {
              "value": 11396,
              "unit": "CNY/month",
              "period": "2021年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-average-wage-2021"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 11396,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-average-wage-2021",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 6520,
                "ceiling": 34188,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2022-official-wechat-repost"
                ],
                "quality": "official_wechat_repost_production_ready"
              },
              "flexible": {
                "floor": 6520,
                "ceiling": 34188,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2022-official-wechat-repost"
                ],
                "quality": "official_wechat_repost_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.16,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "national-enterprise-pension-system-2005",
                "national-social-insurance-rate-2019"
              ],
              "quality": "national_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0612,
              "unit": "annual_rate",
              "period": "2022年度",
              "sourceIds": [
                "national-account-interest-rate-2022"
              ],
              "quality": "official_production_ready"
            }
          },
          {
            "year": 2023,
            "periodLabel": "2023年度，2023-07-01至2024-06-30社保缴费基数口径",
            "effectiveFrom": "2023-07-01",
            "effectiveTo": "2024-06-30",
            "currency": "CNY",
            "averageWage": {
              "value": 12183,
              "unit": "CNY/month",
              "period": "2022年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-social-insurance-base-2023"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 12183,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-social-insurance-base-2023",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 7310,
                "ceiling": 36549,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2023"
                ],
                "quality": "official_production_ready"
              },
              "flexible": {
                "floor": 7310,
                "ceiling": 36549,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2023"
                ],
                "quality": "official_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.16,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "national-enterprise-pension-system-2005",
                "national-social-insurance-rate-2019"
              ],
              "quality": "national_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0397,
              "unit": "annual_rate",
              "period": "2023年度",
              "sourceIds": [
                "national-account-interest-rate-2023"
              ],
              "quality": "official_production_ready"
            }
          },
          {
            "year": 2024,
            "periodLabel": "2024年度，2024-07-01至2025-06-30社保缴费基数口径",
            "effectiveFrom": "2024-07-01",
            "effectiveTo": "2025-06-30",
            "currency": "CNY",
            "averageWage": {
              "value": 12307,
              "unit": "CNY/month",
              "period": "2023年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-contribution-base-2024"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 12307,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-contribution-base-2024",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 7384,
                "ceiling": 36921,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-contribution-base-2024"
                ],
                "quality": "official_production_ready"
              },
              "flexible": {
                "floor": 7384,
                "ceiling": 36921,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-contribution-base-2024"
                ],
                "quality": "official_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.16,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "national-enterprise-pension-system-2005",
                "national-social-insurance-rate-2019"
              ],
              "quality": "national_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.0262,
              "unit": "annual_rate",
              "period": "2024年度",
              "sourceIds": [
                "national-account-interest-rate-2024"
              ],
              "quality": "official_production_ready"
            }
          },
          {
            "year": 2025,
            "periodLabel": "2025年度，2025-07-01至2026-06-30社保缴费基数口径",
            "effectiveFrom": "2025-07-01",
            "effectiveTo": "2026-06-30",
            "currency": "CNY",
            "averageWage": {
              "value": 12434,
              "unit": "CNY/month",
              "period": "2024年度",
              "label": "全口径城镇单位就业人员平均工资或当年缴费基数使用工资口径",
              "sourceIds": [
                "shanghai-social-insurance-base-2025"
              ],
              "quality": "official_production_ready"
            },
            "pensionCalculationBase": {
              "value": 12434,
              "unit": "CNY/month",
              "basis": "上海计发办法使用办理申领时上年度全市城镇单位就业人员月平均工资；历史回补阶段以该年度缴费基数使用工资口径作为当前可用估算口径。",
              "sourceIds": [
                "shanghai-social-insurance-base-2025",
                "shanghai-pension-calculation-method-2025"
              ],
              "quality": "derived_from_official_wage_production_ready"
            },
            "contributionBase": {
              "employee": {
                "floor": 7460,
                "ceiling": 37302,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2025"
                ],
                "quality": "official_production_ready"
              },
              "flexible": {
                "floor": 7460,
                "ceiling": 37302,
                "unit": "CNY/month",
                "sourceIds": [
                  "shanghai-social-insurance-base-2025"
                ],
                "quality": "official_production_ready"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.16,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "national-enterprise-pension-system-2005",
                "national-social-insurance-rate-2019"
              ],
              "quality": "national_policy_production_ready"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [],
              "reviewStatus": "production_ready"
            },
            "accountInterestRate": {
              "value": 0.015,
              "unit": "annual_rate",
              "period": "2025年度",
              "sourceIds": [
                "national-account-interest-rate-2025"
              ],
              "quality": "official_production_ready"
            }
          }
        ]
      },
      "beijing": {
        "name": "北京",
        "yearlyParams": [
          {
            "year": 2025,
            "periodLabel": "2025年度",
            "effectiveFrom": "2025-07-01",
            "effectiveTo": null,
            "currency": "CNY",
            "averageWage": {
              "value": null,
              "unit": "CNY/month",
              "period": "2024年度",
              "label": "全口径城镇单位就业人员平均工资或缴费指数相关工资口径",
              "sourceIds": [],
              "quality": "missing_pending_backfill"
            },
            "pensionCalculationBase": {
              "value": 12049,
              "unit": "CNY/month",
              "basis": "2025年达到退休年龄并办理按月领取基本养老金手续的人员，核算养老保险待遇时使用。",
              "effectiveFrom": "2025-01-01",
              "effectiveTo": "2025-12-31",
              "sourceIds": [
                "beijing-benefit-calculation-base-2025"
              ],
              "quality": "official_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 7162,
                "ceiling": 35811,
                "unit": "CNY/month",
                "sourceIds": [
                  "beijing-contribution-base-2025"
                ],
                "quality": "official_pending_second_review"
              },
              "flexible": {
                "floor": 7162,
                "ceiling": 35811,
                "unit": "CNY/month",
                "sourceIds": [
                  "beijing-contribution-base-2025"
                ],
                "quality": "official_pending_second_review"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.16,
              "personalAccountCreditRate": 0.08,
              "flexibleEmploymentRate": 0.2,
              "sourceIds": [
                "national-enterprise-pension-system-2005",
                "national-social-insurance-rate-2019",
                "beijing-contribution-base-2025"
              ],
              "quality": "mixed_official_pending_second_review"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "averageWage",
                "accountInterestRate"
              ],
              "reviewStatus": "pending_second_review"
            }
          }
        ]
      },
      "shenzhen": {
        "name": "深圳",
        "yearlyParams": [
          {
            "year": 2025,
            "periodLabel": "2025年度",
            "effectiveFrom": "2025-07-01",
            "effectiveTo": null,
            "currency": "CNY",
            "averageWage": {
              "value": null,
              "unit": "CNY/month",
              "period": "2024年度",
              "label": "全口径城镇单位就业人员平均工资或缴费指数相关工资口径",
              "sourceIds": [],
              "quality": "missing_pending_backfill"
            },
            "pensionCalculationBase": {
              "value": 11293,
              "unit": "CNY/month",
              "basis": "深圳市企业职工基本养老保险基本养老金计发基数，适用2025年1月1日至12月31日。",
              "effectiveFrom": "2025-01-01",
              "effectiveTo": "2025-12-31",
              "sourceIds": [
                "shenzhen-pension-calculation-base-2025"
              ],
              "quality": "official_pending_second_review"
            },
            "contributionBase": {
              "employee": {
                "floor": 4775,
                "ceiling": 27549,
                "unit": "CNY/month",
                "applicability": "广东省通知列明全省企业职工基本养老保险缴费基数上限27549元，其他地区下限4775元；深圳适用性需二次复核。",
                "sourceIds": [
                  "guangdong-pension-base-and-contribution-base-2025"
                ],
                "quality": "official_source_pending_shenzhen_applicability_review"
              },
              "flexible": {
                "floor": null,
                "ceiling": null,
                "unit": "CNY/month",
                "sourceIds": [],
                "quality": "missing_pending_backfill"
              }
            },
            "rates": {
              "employeePersonalRate": 0.08,
              "employerRate": 0.16,
              "personalAccountCreditRate": 0.08,
              "sourceIds": [
                "national-enterprise-pension-system-2005",
                "national-social-insurance-rate-2019"
              ],
              "quality": "national_policy_pending_local_review"
            },
            "dataQuality": {
              "level": "partial",
              "missingFields": [
                "averageWage",
                "flexibleContributionBase",
                "accountInterestRate"
              ],
              "reviewStatus": "pending_city_applicability_review"
            }
          }
        ]
      }
    }
  },
  "cityHistoryCoverage": {
    "schemaVersion": "1.0",
    "coverageVersion": "2026.05.28-shanghai-2000-2025",
    "lastUpdated": "2026-05-28",
    "targetYearRange": {
      "from": 2000,
      "to": 2025
    },
    "keyParamsBackfill": {
      "file": "city-key-params-2015-2025.json",
      "scope": "2015-2025 key parameters workspace, not yet canonical production data",
      "summary": {
        "shanghai": "上海 2015-2025 已完成 production ready 复核，作为公开测算支持范围；2000-2007、2013 仍保留为历史补齐 backlog。普通提交会按本次已缴年限检查实际触达年份，触达未复核年份时不开放该组测算。",
        "beijing": "2015-2025 缴费基数已有官方历史表记录；2025 待遇计发基数已记录。",
        "shenzhen": "2024-2025 已有深圳/广东官方来源记录；2015-2023 仍为部分回补。"
      }
    },
    "cities": {
      "shanghai": {
        "name": "上海",
        "officialCompleteYears": [
          2008,
          2009,
          2010,
          2011,
          2012,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023,
          2024,
          2025
        ],
        "partialYears": [
          2000,
          2001,
          2002,
          2003,
          2004,
          2005,
          2006,
          2007,
          2013
        ],
        "missingYears": [],
        "nextBackfillBatch": "source-and-field-review",
        "notes": "上海 2015-2025 已完成 production ready 复核，作为公开测算支持范围；2000-2007、2013 仍保留为历史补齐 backlog。普通提交会按本次已缴年限检查实际触达年份，触达未复核年份时不开放该组测算。",
        "publicSupportedYearRange": {
          "from": 2015,
          "to": 2025
        },
        "releaseGate": "public_supported_range_ready_with_input_level_history_check"
      },
      "beijing": {
        "name": "北京",
        "officialCompleteYears": [],
        "partialYears": [
          2025
        ],
        "missingYears": [
          2000,
          2001,
          2002,
          2003,
          2004,
          2005,
          2006,
          2007,
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023,
          2024
        ],
        "nextBackfillBatch": "2015-2024",
        "notes": "2025已有缴费基数上下限和养老待遇计算基数，仍缺平均工资/记账利率等字段。"
      },
      "shenzhen": {
        "name": "深圳",
        "officialCompleteYears": [],
        "partialYears": [
          2025
        ],
        "missingYears": [
          2000,
          2001,
          2002,
          2003,
          2004,
          2005,
          2006,
          2007,
          2008,
          2009,
          2010,
          2011,
          2012,
          2013,
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023,
          2024
        ],
        "nextBackfillBatch": "2015-2024",
        "notes": "2025已有深圳养老金计发基数；缴费基数来自广东通知，深圳适用性需二次复核。"
      }
    }
  },
  "pensionPolicy": {
    "schemaVersion": "1.0",
    "policyVersion": "2026.05.28-seed",
    "lastUpdated": "2026-05-28",
    "employeePension": {
      "scope": "城镇职工基本养老保险估算",
      "components": [
        "basicPension",
        "personalAccountPension",
        "transitionPension"
      ],
      "basicPensionFormula": {
        "formula": "基础养老金 = (待遇计发基数或上年度当地职工平均工资 + 本人指数化月平均缴费工资) / 2 * 缴费年限 * 1%",
        "notes": [
          "不同城市字段口径可能不同，上海口径使用办理申领时上年度全市城镇单位就业人员月平均工资，北京使用年度养老保险待遇计算基数。",
          "剩余缴费月数的计发比例需按地方规则处理。"
        ],
        "sourceIds": [
          "national-enterprise-pension-system-2005",
          "shanghai-pension-calculation-method-2025"
        ]
      },
      "accountPensionFormula": {
        "formula": "个人账户养老金 = 退休时个人账户储存额 / 计发月数",
        "sourceIds": [
          "national-enterprise-pension-system-2005",
          "shanghai-pension-calculation-method-2025",
          "shanghai-payout-months-table"
        ]
      },
      "transitionPension": {
        "v1Handling": "暂不精算，作为结果页提示或低精度补充项。",
        "notes": [
          "过渡性养老金地区差异大，涉及视同缴费、统账结合前后政策、地方历史规则。",
          "上海示例涉及1992年底以前参加工作、1993-1997虚账实记等口径。"
        ],
        "sourceIds": [
          "shanghai-pension-calculation-method-2025"
        ]
      },
      "rates": {
        "employeePersonalRate": {
          "value": 0.08,
          "meaning": "职工个人缴费比例，通常记入个人账户。",
          "sourceIds": [
            "national-enterprise-pension-system-2005"
          ],
          "status": "official_pending_second_review"
        },
        "personalAccountCreditRate": {
          "value": 0.08,
          "meaning": "个人账户规模按本人缴费工资8%记入。",
          "sourceIds": [
            "national-enterprise-pension-system-2005"
          ],
          "status": "official_pending_second_review"
        },
        "employerContributionRate": {
          "value": 0.16,
          "meaning": "企业职工基本养老保险单位缴费比例一般可降至16%，具体以地方执行口径为准。",
          "sourceIds": [
            "national-social-insurance-rate-2019"
          ],
          "status": "official_pending_local_review"
        }
      },
      "eligibility": {
        "minimumContributionYears": {
          "before2030": 15,
          "gradualIncrease": {
            "startsFromYear": 2030,
            "targetYears": 20,
            "notes": "自2030年1月1日起，最低缴费年限由15年逐步提高至20年，具体按退休年份规则处理。"
          },
          "sourceIds": [
            "national-retirement-age-2024",
            "national-social-insurance-law-2010"
          ],
          "status": "official_pending_rule_table"
        }
      },
      "retirementAgePolicy": {
        "type": "progressive_delay",
        "effectiveFrom": "2025-01-01",
        "sourceIds": [
          "national-retirement-age-2024"
        ],
        "status": "source_recorded_rule_table_not_built",
        "notes": [
          "正式计算需要按出生年月、性别、岗位类型生成 retirement-age-rules.json。",
          "当前仅记录政策来源，尚未维护完整查表。"
        ]
      }
    }
  },
  "retirementRules": {
    "schemaVersion": "1.0",
    "ruleVersion": "2026.05.28-seed",
    "lastUpdated": "2026-05-28",
    "status": "rules_encoded_pending_sample_verification",
    "sourceIds": [
      "national-retirement-age-2024"
    ],
    "sourceUrls": [
      "https://www.npc.gov.cn/npc/c2/kgfb/202409/t20240913_439534.html",
      "https://www.gov.cn/yaowen/liebiao/202409/content_6974294.htm",
      "https://si.12333.gov.cn/184940.jhtml?menuguide=1"
    ],
    "notes": [
      "根据全国人大常委会关于实施渐进式延迟法定退休年龄的决定编码。",
      "正式上线前需要用国家社保公共服务平台退休年龄计算器抽样校验。",
      "本文件不处理特殊工种、病退、弹性提前/延迟退休的个案审批，只给出法定退休年龄基础规则。"
    ],
    "rules": [
      {
        "workerType": "male",
        "label": "男职工",
        "originalRetirementAge": {
          "years": 60,
          "months": 0
        },
        "targetRetirementAge": {
          "years": 63,
          "months": 0
        },
        "effectiveFrom": "2025-01-01",
        "delayPolicy": {
          "stepMonths": 4,
          "delayMonthsPerStep": 1,
          "maxDelayMonths": 36,
          "formula": "delayMonths = clamp(floor(monthsBetween(2025-01, originalRetirementDateMonth) / 4) + 1, 0, 36), only if originalRetirementDateMonth >= 2025-01"
        },
        "unaffectedBirthBefore": "1965-01",
        "fullyDelayedBirthFrom": "1977-01",
        "tableBirthRange": {
          "from": "1965-01",
          "to": "1976-12"
        }
      },
      {
        "workerType": "female_original_55",
        "label": "原法定退休年龄55周岁的女职工",
        "originalRetirementAge": {
          "years": 55,
          "months": 0
        },
        "targetRetirementAge": {
          "years": 58,
          "months": 0
        },
        "effectiveFrom": "2025-01-01",
        "delayPolicy": {
          "stepMonths": 4,
          "delayMonthsPerStep": 1,
          "maxDelayMonths": 36,
          "formula": "delayMonths = clamp(floor(monthsBetween(2025-01, originalRetirementDateMonth) / 4) + 1, 0, 36), only if originalRetirementDateMonth >= 2025-01"
        },
        "unaffectedBirthBefore": "1970-01",
        "fullyDelayedBirthFrom": "1982-01",
        "tableBirthRange": {
          "from": "1970-01",
          "to": "1981-12"
        }
      },
      {
        "workerType": "female_original_50",
        "label": "原法定退休年龄50周岁的女职工",
        "originalRetirementAge": {
          "years": 50,
          "months": 0
        },
        "targetRetirementAge": {
          "years": 55,
          "months": 0
        },
        "effectiveFrom": "2025-01-01",
        "delayPolicy": {
          "stepMonths": 2,
          "delayMonthsPerStep": 1,
          "maxDelayMonths": 60,
          "formula": "delayMonths = clamp(floor(monthsBetween(2025-01, originalRetirementDateMonth) / 2) + 1, 0, 60), only if originalRetirementDateMonth >= 2025-01"
        },
        "unaffectedBirthBefore": "1975-01",
        "fullyDelayedBirthFrom": "1985-01",
        "tableBirthRange": {
          "from": "1975-01",
          "to": "1984-12"
        }
      }
    ],
    "minimumContributionYearsByRetirementYear": [
      {
        "retirementYearFrom": 2025,
        "retirementYearTo": 2029,
        "requiredYears": 15,
        "requiredMonths": 0
      },
      {
        "retirementYearFrom": 2030,
        "retirementYearTo": 2030,
        "requiredYears": 15,
        "requiredMonths": 6
      },
      {
        "retirementYearFrom": 2031,
        "retirementYearTo": 2031,
        "requiredYears": 16,
        "requiredMonths": 0
      },
      {
        "retirementYearFrom": 2032,
        "retirementYearTo": 2032,
        "requiredYears": 16,
        "requiredMonths": 6
      },
      {
        "retirementYearFrom": 2033,
        "retirementYearTo": 2033,
        "requiredYears": 17,
        "requiredMonths": 0
      },
      {
        "retirementYearFrom": 2034,
        "retirementYearTo": 2034,
        "requiredYears": 17,
        "requiredMonths": 6
      },
      {
        "retirementYearFrom": 2035,
        "retirementYearTo": 2035,
        "requiredYears": 18,
        "requiredMonths": 0
      },
      {
        "retirementYearFrom": 2036,
        "retirementYearTo": 2036,
        "requiredYears": 18,
        "requiredMonths": 6
      },
      {
        "retirementYearFrom": 2037,
        "retirementYearTo": 2037,
        "requiredYears": 19,
        "requiredMonths": 0
      },
      {
        "retirementYearFrom": 2038,
        "retirementYearTo": 2038,
        "requiredYears": 19,
        "requiredMonths": 6
      },
      {
        "retirementYearFrom": 2039,
        "retirementYearTo": null,
        "requiredYears": 20,
        "requiredMonths": 0
      }
    ],
    "verificationSamples": [
      {
        "workerType": "male",
        "birthMonth": "1965-01",
        "expectedDelayMonths": 1,
        "expectedRetirementAge": "60岁1个月",
        "expectedRetirementMonth": "2025-02"
      },
      {
        "workerType": "male",
        "birthMonth": "1976-12",
        "expectedDelayMonths": 36,
        "expectedRetirementAge": "63岁",
        "expectedRetirementMonth": "2039-12"
      },
      {
        "workerType": "female_original_55",
        "birthMonth": "1970-01",
        "expectedDelayMonths": 1,
        "expectedRetirementAge": "55岁1个月",
        "expectedRetirementMonth": "2025-02"
      },
      {
        "workerType": "female_original_55",
        "birthMonth": "1981-12",
        "expectedDelayMonths": 36,
        "expectedRetirementAge": "58岁",
        "expectedRetirementMonth": "2039-12"
      },
      {
        "workerType": "female_original_50",
        "birthMonth": "1975-01",
        "expectedDelayMonths": 1,
        "expectedRetirementAge": "50岁1个月",
        "expectedRetirementMonth": "2025-02"
      },
      {
        "workerType": "female_original_50",
        "birthMonth": "1984-12",
        "expectedDelayMonths": 60,
        "expectedRetirementAge": "55岁",
        "expectedRetirementMonth": "2039-12"
      }
    ]
  },
  "payoutMonths": {
    "schemaVersion": "1.0",
    "tableVersion": "2026.05.28-seed",
    "lastUpdated": "2026-05-28",
    "sourceIds": [
      "shanghai-payout-months-table",
      "national-enterprise-pension-system-2005"
    ],
    "status": "official_table_pending_second_review",
    "monthsByRetirementAge": {
      "40": 233,
      "41": 230,
      "42": 226,
      "43": 223,
      "44": 220,
      "45": 216,
      "46": 212,
      "47": 208,
      "48": 204,
      "49": 199,
      "50": 195,
      "51": 190,
      "52": 185,
      "53": 180,
      "54": 175,
      "55": 170,
      "56": 164,
      "57": 158,
      "58": 152,
      "59": 145,
      "60": 139,
      "61": 132,
      "62": 125,
      "63": 117,
      "64": 109,
      "65": 101,
      "66": 93,
      "67": 84,
      "68": 75,
      "69": 65,
      "70": 56
    }
  },
  "benchmarkMeta": {
    "schemaVersion": "1.0",
    "benchmarkVersion": null,
    "status": "not_generated",
    "reason": "城市历史参数尚未补齐并复核，基准样本暂未生成。",
    "requiredBeforeGeneration": [
      "补齐并复核目标年份城市历史参数",
      "复核养老保险政策参数",
      "复核计发月数表",
      "固定样本生成规则"
    ]
  }
};
